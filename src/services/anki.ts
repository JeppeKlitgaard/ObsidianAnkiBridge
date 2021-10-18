import { Card } from 'entities/card'
import {
    sourceField,
    codeScript,
    highlightjsBase64,
    hihglightjsInitBase64,
    highlightCssBase64,
    codeDeckExtension,
    sourceDeckExtension,
} from 'consts'
import { ISettings } from 'settings/settings'
import {
    AddNoteRequest,
    AddNoteResponse,
    AddTagsRequest,
    CardsInfoRequest,
    CardsInfoResponse,
    ChangeDeckRequest,
    ChangeDeckResponse,
    DeleteNoteResponse,
    DeleteNotesRequest,
    NotesInfoRequest,
    NotesInfoResponseEntity,
    RemoveTagsRequest,
    RemoveTagsResponse,
    ResponseEntity,
    UpdateNoteFieldsRequest,
    UpdateNoteFieldsResponse,
} from 'entities/network'
import { NoteBase } from 'notes/base'
import _ from 'lodash'
import { App } from 'obsidian'
import AnkiBridgePlugin from 'main'

export class Anki {
    private static version = 6

    // See: https://github.com/FooSoft/anki-connect
    constructor(public app: App, public plugin: AnkiBridgePlugin) {}

    private getHostString(): string {
        const str = `http://${this.plugin.settings.ankiConnectAddress}:${this.plugin.settings.ankiConnectPort}`

        return str
    }

    // public async createModels(sourceSupport: boolean, codeHighlightSupport: boolean) {
    //     let models = this.getModels(sourceSupport, false)
    //     if (codeHighlightSupport) {
    //         models = models.concat(this.getModels(sourceSupport, true))
    //     }

    //     return this.invoke('multi', 6, { actions: models })
    // }

    // Network Commands
    public async cardsInfo(cardIds: Array<number>): Promise<CardsInfoResponse> {
        const params: CardsInfoRequest = {
            cards: cardIds,
        }

        return await this.invoke('cardsInfo', Anki.version, params)
    }

    public async changeDeck(cardIds: Array<number>, deck: string): Promise<ChangeDeckResponse> {
        const params: ChangeDeckRequest = {
            cards: cardIds,
            deck: deck,
        }

        return await this.invoke('changeDeck', Anki.version, params)
    }

    public async addNote(
        note: NoteBase,
        deckName: string,
        modelName: string,
        fields: Record<string, string>,
    ): Promise<AddNoteResponse> {
        const params: AddNoteRequest = {
            note: {
                deckName: deckName,
                modelName: modelName,
                fields: fields,
                tags: note.tags || [],
            },
        }

        return await this.invoke('addNote', Anki.version, params)
    }

    public async deleteNote(note: NoteBase): Promise<DeleteNoteResponse> {
        const params: DeleteNotesRequest = {
            notes: [note.id],
        }

        return await this.invoke('deleteNotes', Anki.version, params)
    }

    public async updateNoteFields(
        note: NoteBase,
        fields: Record<string, string>,
    ): Promise<UpdateNoteFieldsResponse> {
        const params: UpdateNoteFieldsRequest = {
            note: {
                id: note.id,
                fields: fields,
            },
        }

        return await this.invoke('updateNoteFields', Anki.version, params)
    }

    public async noteInfo(note: NoteBase): Promise<NotesInfoResponseEntity> {
        const params: NotesInfoRequest = {
            notes: [note.id],
        }

        const response = await this.invoke('notesInfo', Anki.version, params)
        return response[0]
    }

    public async addTags(note: NoteBase, tags: Array<string>): Promise<AddTagsRequest> {
        const params: AddTagsRequest = {
            notes: [note.id],
            tags: tags.join(' '),
        }

        return await this.invoke('addTags', Anki.version, params)
    }

    public async removeTags(note: NoteBase, tags: Array<string>): Promise<RemoveTagsRequest> {
        const params: RemoveTagsRequest = {
            notes: [note.id],
            tags: tags.join(' '),
        }

        return await this.invoke('removeTags', Anki.version, params)
    }

    public async setTags(note: NoteBase, tags: Array<string>): Promise<RemoveTagsRequest> {
        const alreadySetTags: Array<string> = (await this.noteInfo(note)).tags
        const tagsToAdd = _.difference(tags, alreadySetTags)
        const tagsToRemove = _.difference(alreadySetTags, tags)

        if (tagsToAdd.length) {
            await this.addTags(note, tagsToAdd)
        }
        if (tagsToRemove.length) {
            await this.removeTags(note, tagsToRemove)
        }

        return null
    }

    public async storeMediaFile(cards: Card[]) {
        const actions: any[] = []

        for (const card of cards) {
            for (const media of card.getMedias()) {
                actions.push({
                    action: 'storeMediaFile',
                    params: media,
                })
            }
        }

        if (actions) {
            return this.invoke('multi', 6, { actions: actions })
        } else {
            return {}
        }
    }

    public async storeCodeHighlightMedias() {
        const fileExists = await this.invoke('retrieveMediaFile', 6, {
            filename: '_highlightInit.js',
        })

        if (!fileExists) {
            const highlightjs = {
                action: 'storeMediaFile',
                params: {
                    filename: '_highlight.js',
                    data: highlightjsBase64,
                },
            }
            const highlightjsInit = {
                action: 'storeMediaFile',
                params: {
                    filename: '_highlightInit.js',
                    data: hihglightjsInitBase64,
                },
            }
            const highlightjcss = {
                action: 'storeMediaFile',
                params: {
                    filename: '_highlight.css',
                    data: highlightCssBase64,
                },
            }
            return this.invoke('multi', 6, {
                actions: [highlightjs, highlightjsInit, highlightjcss],
            })
        }
    }

    public async addCards(cards: Card[]): Promise<ResponseEntity> {
        const notes: any = []

        cards.forEach((card) => notes.push(card.getCard(false)))

        return this.invoke('addNotes', 6, {
            notes: notes,
        })
    }

    /**
     * Given the new cards with an optional deck name, it updates all the cards on Anki.
     *
     * Be aware of https://github.com/FooSoft/anki-connect/issues/82. If the Browse pane is opened on Anki,
     * the update does not change all the cards.
     * @param cards the new cards.
     * @param deckName the new deck name.
     */
    public async updateCards(cards: Card[]): Promise<any> {
        let updateActions: any[] = []

        // Unfortunately https://github.com/FooSoft/anki-connect/issues/183
        // This means that the delta from the current tags on Anki and the generated one should be added/removed
        // That's what the current approach does, but in the future if the API it is made more consistent
        //  then mergeTags(...) is not needed anymore
        const ids: number[] = []

        for (const card of cards) {
            updateActions.push({
                action: 'updateNoteFields',
                params: {
                    note: card.getCard(true),
                },
            })

            updateActions = updateActions.concat(this.mergeTags(card.oldTags, card.tags, card.id))
            ids.push(card.id)
        }

        // Update deck
        updateActions.push({
            action: 'changeDeck',
            params: {
                cards: ids,
                deck: cards[0].deckName,
            },
        })

        return this.invoke('multi', 6, { actions: updateActions })
    }

    public async getCards(ids: number[]) {
        return await this.invoke('notesInfo', 6, { notes: ids })
    }

    public async deleteCards(ids: number[]) {
        return this.invoke('deleteNotes', 6, { notes: ids })
    }

    public async ping(): Promise<boolean> {
        return (await this.invoke('version', 6)) === 6
    }

    private mergeTags(oldTags: string[], newTags: string[], cardId: number) {
        const actions = []

        // Find tags to Add
        for (const tag of newTags) {
            const index = oldTags.indexOf(tag)
            if (index > -1) {
                oldTags.splice(index, 1)
            } else {
                actions.push({
                    action: 'addTags',
                    params: {
                        notes: [cardId],
                        tags: tag,
                    },
                })
            }
        }

        // All Tags to delete
        for (const tag of oldTags) {
            actions.push({
                action: 'removeTags',
                params: {
                    notes: [cardId],
                    tags: tag,
                },
            })
        }

        return actions
    }

    private invoke(action: string, version = 6, params: Record<string, any> = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.addEventListener('error', () => reject('failed to issue request'))
            xhr.addEventListener('load', () => {
                try {
                    const response = JSON.parse(xhr.responseText)
                    if (Object.getOwnPropertyNames(response).length != 2) {
                        throw 'response has an unexpected number of fields'
                    }
                    if (!response.hasOwnProperty('error')) {
                        throw 'response is missing required error field'
                    }
                    if (!response.hasOwnProperty('result')) {
                        throw 'response is missing required result field'
                    }
                    if (response.error) {
                        throw response.error
                    }
                    resolve(response.result)
                } catch (e) {
                    reject(e)
                }
            })

            xhr.open('POST', this.getHostString())
            xhr.send(JSON.stringify({ action, version, params }))
        })
    }
}
