import AnkiBridgePlugin from 'main'
import { NoteBase } from 'notes/base'
import { App, Notice } from 'obsidian'
import { ProcessedFileResult } from './reader'
import _ from 'lodash'
import { NotesInfoResponseEntity } from 'entities/network'
import promiseAllProperties from 'promise-all-properties'
import { Preprocessor } from 'processors/preprocessors/base'
import { Postprocessor } from 'processors/postprocessors/base'
import { getProcessorById } from 'processors'
import { ProcessorContext } from 'processors/base'
import { processMarkdownToHtml } from 'processors/html'
import { Field, NoteAction } from 'entities/note'

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

    private async processNote(note: NoteBase): Promise<NoteAction> {
        const anki = this.plugin.anki

        // Skip
        if (note.enabled === false) {
            return NoteAction.Skipped
        }

        // Delete
        if (note.delete_) {
            anki.deleteNote(note)
            note.delete_ = undefined
            note.enabled = false
            note.id = undefined

            return NoteAction.Deleted
        }

        const deckName = note.getDeckName(this.plugin)
        const modelName = note.modelName || this.plugin.settings.defaultModel
        const tagsToSet = [this.plugin.settings.tagInAnki, ...(note.tags != null ? note.tags : [])]
        const renderedFields = await this.renderFields(note)

        // Create if does not exist
        if (note.id === null) {
            // We must create note
            const id = await anki.addNote(note, deckName, modelName, renderedFields)
            note.id = id

            await anki.setTags(note, tagsToSet)

            return NoteAction.Created
        }

        // Note has ID --->
        // Check if note exists on Anki
        const noteInfo = await anki.noteInfo(note)

        // No note with that ID found. Make it
        if (_.isEmpty(noteInfo)) {
            const id = await anki.addNote(note, deckName, modelName, renderedFields)
            note.id = id

            return NoteAction.Created
        }

        // Note exists on source and on Anki --->
        const notePairDelta = await this.notePairChanges(note, noteInfo, renderedFields)

        // Note pair did not change, but we did check
        if (!notePairDelta.shouldUpdate) {
            return NoteAction.Checked
        }

        // Note pair changed
        // We must update fields
        if (notePairDelta.shouldUpdateFields) {
            await anki.updateNoteFields(note, renderedFields)
        }

        // We must update tags
        if (notePairDelta.shouldUpdateTags) {
            await anki.setTags(note, tagsToSet)
        }

        // We must update deck
        if (notePairDelta.cardsToUpdate.length) {
            await anki.changeDeck(notePairDelta.cardsToUpdate, deckName)
        }

        return NoteAction.Updated
    }

    public async processFileResults(results: ProcessedFileResult): Promise<Array<NoteAction>> {
        let shouldUpdateSource = false

        const actions: Array<NoteAction> = []

        // Pass over all elements
        for (const element of results.elements) {
            // If element is a fragment, ignore
            if (!(element instanceof NoteBase)) {
                continue
            }

            const note = element

            let action: NoteAction
            try {
                action = await this.processNote(note)
            } catch (e) {
                if (!this.handleError(e, note)) {
                    action = NoteAction.NonFatalError
                }
            }

            actions.push(action)
            shouldUpdateSource = shouldUpdateSource || note.shouldUpdateFile()

            this.plugin.debug(`${NoteAction[action]}: ${note.id}`)
        }

        // Update file if content has changed
        if (shouldUpdateSource) {
            await this.app.vault.modify(results.sourceFile, results.elements.renderAsText())
        }

        return actions
    }
}
