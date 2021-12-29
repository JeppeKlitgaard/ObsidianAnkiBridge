import AnkiBridgePlugin from 'main'
import { NoteBase } from 'notes/base'
import { App, Notice } from 'obsidian'
import { ProcessedFileResult } from './reader'
import _ from 'lodash'
import { NotesInfoResponseEntity } from 'entities/network'
import { FileProcessingResult } from 'entities/other'
import promiseAllProperties from 'promise-all-properties'
import { Preprocessor } from 'processors/preprocessors/base'
import { Postprocessor } from 'processors/postprocessors/base'
import { getProcessorById } from 'processors'
import { ProcessorContext } from 'processors/base'
import { processMarkdownToHtml } from 'processors/html'
import { Field } from 'entities/note'

interface NotePairDelta {
    shouldUpdate: boolean
    shouldUpdateFields: boolean
    shouldUpdateTags: boolean
    cardsToUpdate: Array<number>
}

export class Bridge {
    private preprocessors: Array<Preprocessor> = []
    private postprocessors: Array<Postprocessor> = []

    constructor(public app: App, public plugin: AnkiBridgePlugin) {
        for (const [id, enabled] of Object.entries(this.plugin.settings.getMergedProcessors())) {
            if (enabled) {
                const processorClass = getProcessorById(id)
                const processor = new processorClass(this.app, this.plugin)

                if (processor instanceof Preprocessor) {
                    this.preprocessors.push(processor)
                } else {
                    this.postprocessors.push(processor)
                }
            }
        }

        // Sort processors
        this.preprocessors = _.sortBy(this.preprocessors, [
            (o) => {
                return Object.getPrototypeOf(o).constructor.weight
            },
        ])
        this.postprocessors = _.sortBy(this.postprocessors, [
            (o) => {
                return Object.getPrototypeOf(o).constructor.weight
            },
        ])
    }

    public async processField(
        note: NoteBase,
        field: string,
        ctx: ProcessorContext,
    ): Promise<string> {
        // Do all Markdown preprocessing
        for (const pp of this.preprocessors) {
            field = await pp.preprocess(note, field, ctx)
        }
        // Convert to HTML DOM
        const domField = await processMarkdownToHtml(note, field, ctx)

        // Do all HTML postprocessing
        for (const pp of this.postprocessors) {
            await pp.postprocess(note, domField, ctx)
        }

        // Turn back into string
        return domField.innerHTML
    }

    public async processFields(
        note: NoteBase,
        fields: Record<Field, string>,
    ): Promise<Record<Field, string>> {
        const promisedTransforms = _.transform(
            fields,
            (result: Record<Field, Promise<string>>, field, fieldName: Field) => {
                const ctx: ProcessorContext = {
                    fieldName: fieldName,
                }

                result[fieldName] = this.processField(note, field, ctx)
            },
        )

        return await promiseAllProperties(promisedTransforms)
    }

    public async renderFields(note: NoteBase): Promise<Record<string, string>> {
        return await this.processFields(note, note.renderFields())
    }

    private async notePairChanges(
        note: NoteBase,
        noteInfo: NotesInfoResponseEntity,
        renderedNote?: Record<Field, string>,
    ): Promise<NotePairDelta> {
        let shouldUpdateFields = false
        let shouldUpdateTags = false
        let cardsToUpdate: Array<number> = []

        if (renderedNote === undefined) {
            renderedNote = await this.renderFields(note)
        }

        // Check that fields are the same
        if (!_.isEqual(note.normaliseNoteInfoFields(noteInfo.fields), renderedNote)) {
            shouldUpdateFields = true
        }

        // Check that tags are the same
        const sourceTags = [...(note.tags || []), this.plugin.settings.tagInAnki]
        if (!_.isEqual(_.sortBy(sourceTags), _.sortBy(noteInfo.tags))) {
            shouldUpdateTags = true
        }

        // Cannot actually update modelName - skip checking
        const cardsInfos = await this.plugin.anki.cardsInfo(noteInfo.cards)
        const cardsInfosToUpdate = _.filter(cardsInfos, (value) => {
            return value.deckName.toLowerCase() !== note.getDeckName(this.plugin).toLowerCase()
        })
        cardsToUpdate = _.map(cardsInfosToUpdate, 'cardId')

        const shouldUpdate = shouldUpdateFields || shouldUpdateTags || !_.isEmpty(cardsToUpdate)

        return {
            shouldUpdate: shouldUpdate,
            shouldUpdateFields: shouldUpdateFields,
            shouldUpdateTags: shouldUpdateTags,
            cardsToUpdate: cardsToUpdate,
        }
    }

    private displayError(e: string, note: NoteBase): void {
        new Notice(`For note with ID: ${note.id}, we got error:\n\n${_.capitalize(e)}`)
    }

    /**
     * Returns true if error is not fatal for that note
     */
    private handleError(e: string | Error, note: NoteBase): boolean {
        if (typeof e === 'string') {
            if (e.startsWith('deck was not found')) {
                this.displayError(e, note)
                return false
            } else if (e === 'cannot create note because it is a duplicate') {
                this.displayError(e, note)
                return false
            }
        } else {
            this.displayError(e.toString(), note)
            throw e // For now
            return false
        }

        throw e
    }

    public async processFileResults(results: ProcessedFileResult): Promise<FileProcessingResult> {
        let shouldUpdateSource = false

        let nonFatalErrors = 0
        let notesProcessed = 0
        let notesSynced = 0

        // Pass over all elements
        for (const element of results.elements) {
            // If element is a fragment, ignore
            if (!(element instanceof NoteBase)) {
                continue
            }

            notesProcessed++

            if (element.enabled === false) {
                continue
            }

            const deckName = element.getDeckName(this.plugin)
            const modelName = element.modelName || this.plugin.settings.defaultModel
            const tagsToSet = [
                this.plugin.settings.tagInAnki,
                ...(element.tags != null ? element.tags : []),
            ]
            const renderedFields = await this.renderFields(element)

            try {
                // If delete is set
                if (element.delete_) {
                    this.plugin.anki.deleteNote(element)
                    element.delete_ = undefined
                    element.enabled = false
                    element.id = undefined

                    shouldUpdateSource = true

                    notesSynced++
                    continue
                }

                // If note has no id, create note and assign id
                if (element.id === null) {
                    // We must create note
                    const id = await this.plugin.anki.addNote(
                        element,
                        deckName,
                        modelName,
                        renderedFields,
                    )
                    element.id = id

                    await this.plugin.anki.setTags(element, tagsToSet)

                    notesSynced++

                    // Note already has id
                } else {
                    const noteInfo = await this.plugin.anki.noteInfo(element)

                    // No note with that ID found. Make it
                    if (_.isEmpty(noteInfo)) {
                        const id = await this.plugin.anki.addNote(
                            element,
                            deckName,
                            modelName,
                            renderedFields,
                        )
                        element.id = id

                        notesSynced++

                        // Note pair found
                    } else {
                        const notePairDelta = await this.notePairChanges(
                            element,
                            noteInfo,
                            renderedFields,
                        )
                        // Note pair changed
                        if (notePairDelta.shouldUpdate) {
                            if (notePairDelta.shouldUpdateFields) {
                                await this.plugin.anki.updateNoteFields(element, renderedFields)
                            }

                            if (notePairDelta.shouldUpdateTags) {
                                await this.plugin.anki.setTags(element, tagsToSet)
                            }

                            if (notePairDelta.cardsToUpdate.length) {
                                await this.plugin.anki.changeDeck(
                                    notePairDelta.cardsToUpdate,
                                    deckName,
                                )
                            }

                            notesSynced++
                        }
                    }
                }
            } catch (e) {
                if (!this.handleError(e, element)) {
                    nonFatalErrors++
                    continue
                }
            }

            shouldUpdateSource = shouldUpdateSource || element.shouldUpdateFile()
        }

        // Update file if content has changed
        if (shouldUpdateSource) {
            await this.app.vault.modify(results.sourceFile, results.elements.renderAsText())
        }

        const result: FileProcessingResult = {
            nonFatalErrors: nonFatalErrors,
            notesProcessed: notesProcessed,
            notesSynced: notesSynced,
        }

        return result
    }
}
