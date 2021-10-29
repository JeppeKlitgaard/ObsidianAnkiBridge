import AnkiBridgePlugin from 'main'
import { NoteBase } from 'notes/base'
import { App, Notice } from 'obsidian'
import { ProcessedFileResult } from './reader'
import * as _ from 'lodash'
import { Postprocessor, PostprocessorContext } from 'postprocessors/base'
import { getPostprocessorById } from 'postprocessors'
import { NotesInfoResponseEntity } from 'entities/network'

interface NotePairDelta {
    shouldUpdate: boolean
    shouldUpdateFields: boolean
    shouldUpdateTags: boolean
    cardsToUpdate: Array<number>
}

export class Bridge {
    private postprocessors: Array<Postprocessor> = []

    constructor(public app: App, public plugin: AnkiBridgePlugin) {
        for (const [id, enabled] of Object.entries(this.plugin.settings.postprocessors)) {
            if (enabled) {
                const postprocessorClass = getPostprocessorById(id)
                const postprocessor = new postprocessorClass(this.app, this.plugin)

                this.postprocessors.push(postprocessor)
            }
        }

        this.postprocessors = _.sortBy(this.postprocessors, [
            (o) => {
                return Object.getPrototypeOf(o).constructor.weight
            },
        ])
    }

    public postprocessField(note: NoteBase, field: string, ctx: PostprocessorContext): string {
        for (const pp of this.postprocessors) {
            field = pp.process(note, field, ctx)
        }

        return field
    }

    public postprocessFields(
        note: NoteBase,
        fields: Record<string, string>,
    ): Record<string, string> {
        return _.transform(fields, (result, field, fieldName) => {
            const ctx: PostprocessorContext = {
                fieldName: fieldName,
            }

            result[fieldName] = this.postprocessField(note, field, ctx)
        })
    }

    public renderFields(note: NoteBase): Record<string, string> {
        return this.postprocessFields(note, note.renderFields())
    }

    private async notePairChanges(
        note: NoteBase,
        noteInfo: NotesInfoResponseEntity,
    ): Promise<NotePairDelta> {
        let shouldUpdateFields = false
        let shouldUpdateTags = false
        let cardsToUpdate: Array<number> = []

        // Check that fields are the same
        if (!_.isEqual(note.normaliseNoteInfoFields(noteInfo.fields), this.renderFields(note))) {
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

        const shouldUpdate = shouldUpdateFields || shouldUpdateTags || !_.isEmpty(cardsInfos)

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
    private handleError(e: string, note: NoteBase): boolean {
        if (e.startsWith('deck was not found')) {
            this.displayError(e, note)
            return false
        } else if (e === 'cannot create note because it is a duplicate') {
            this.displayError(e, note)
            return false
        }

        throw e
    }

    public async processFileResults(results: ProcessedFileResult): Promise<number> {
        let shouldUpdateSource = false
        let numberOfErrors = 0

        // Pass over all elements
        for (const element of results.elements) {
            // If element is a fragment, ignore
            if (!(element instanceof NoteBase)) {
                continue
            }

            const deckName = element.getDeckName(this.plugin)
            const modelName = element.modelName || this.plugin.settings.defaultModel
            const tagsToSet = [
                this.plugin.settings.tagInAnki,
                ...(element.tags != null ? element.tags : []),
            ]

            if (element.enabled === false) {
                continue
            }

            // If delete is set
            if (element.delete_) {
                this.plugin.anki.deleteNote(element)
                element.delete_ = undefined
                element.enabled = false
                element.id = undefined

                shouldUpdateSource = true

                continue
            }

            // If note has no id, create note and assign id
            if (element.id === null) {
                // We must create note
                try {
                    const id = await this.plugin.anki.addNote(
                        element,
                        deckName,
                        modelName,
                        this.renderFields(element),
                    )
                    element.id = id

                    await this.plugin.anki.setTags(element, tagsToSet)
                } catch (e) {
                    if (!this.handleError(e, element)) {
                        numberOfErrors++
                        continue
                    }
                }
                // Note already has id
            } else {
                const noteInfo = await this.plugin.anki.noteInfo(element)

                // No note with that ID found. Make it
                if (_.isEmpty(noteInfo)) {
                    try {
                        const id = await this.plugin.anki.addNote(
                            element,
                            deckName,
                            modelName,
                            this.renderFields(element),
                        )
                        element.id = id
                    } catch (e) {
                        if (!this.handleError(e, element)) {
                            numberOfErrors++
                            continue
                        }
                    }

                // Note pair found
                } else {
                    const notePairDelta = await this.notePairChanges(element, noteInfo)
                    // Note pair changed
                    if (notePairDelta.shouldUpdate) {
                        if (notePairDelta.shouldUpdateFields) {
                            await this.plugin.anki.updateNoteFields(
                                element,
                                this.renderFields(element),
                            )
                        }

                        if (notePairDelta.shouldUpdateTags) {
                            await this.plugin.anki.setTags(element, tagsToSet)
                        }

                        if (notePairDelta.cardsToUpdate.length) {
                            await this.plugin.anki.changeDeck(notePairDelta.cardsToUpdate, deckName)
                        }
                    }
                }
            }

            shouldUpdateSource = shouldUpdateSource || element.shouldUpdateFile()
        }

        // Update file if content has changed
        if (shouldUpdateSource) {
            let newContent = ''

            for (const element of results.elements) {
                if (!(element instanceof NoteBase)) {
                    newContent += element['text']
                    continue
                }

                newContent += element.renderAsText()
            }

            await this.app.vault.modify(results.sourceFile, newContent)
        }

        return numberOfErrors
    }
}
