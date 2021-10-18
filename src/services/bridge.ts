import { FragmentProcessingResult } from 'entities/note'
import AnkiBridgePlugin from 'main'
import { NoteBase } from 'notes/base'
import { App } from 'obsidian'
import { ProcessedFileResult } from './reader'
import * as _ from 'lodash'
import { Postprocessor } from 'postprocessors/base'
import { getPostprocessorById } from 'postprocessors'
import { NotesInfoResponseEntity } from 'entities/network'
import { sourceField } from 'consts'

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

    public postprocessField(field: string): string {
        for (const pp of this.postprocessors) {
            field = pp.process(field)
        }

        return field
    }

    public postprocessFields(fields: Record<string, string>): Record<string, string> {
        return _.mapValues(fields, (field) => {
            return this.postprocessField(field)
        })
    }

    public renderFields(note: NoteBase): Record<string, string> {
        return this.postprocessFields(note.renderFields())
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
            return value.deckName !== (note.deckName || this.plugin.settings.defaultDeck)
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

    public async processFileResults(results: ProcessedFileResult): Promise<void> {
        let shouldUpdateSource = false

        // Pass over all elements
        for (const element of results.elements) {
            // If element is a fragment, ignore
            if (!(element instanceof NoteBase)) {
                continue
            }

            const deckName = element.deckName || this.plugin.settings.defaultDeck
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
            if (element.id == null) {
                // We must create note
                const id = await this.plugin.anki.addNote(
                    element,
                    deckName,
                    modelName,
                    this.renderFields(element),
                )
                element.id = id

                await this.plugin.anki.setTags(element, tagsToSet)

                // Note already has id
            } else {
                const noteInfo = await this.plugin.anki.noteInfo(element)

                // No note with that ID found. Make it
                if (_.isEmpty(noteInfo)) {
                    const id = await this.plugin.anki.addNote(
                        element,
                        deckName,
                        modelName,
                        this.renderFields(element),
                    )
                    element.id = id

                    // Note pair found
                } else {
                    // Note pair changed
                    const notePairDelta = await this.notePairChanges(element, noteInfo)
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
    }
}
