import { Card } from 'entities/card'
import { highlightjsBase64, hihglightjsInitBase64, highlightCssBase64 } from 'consts'
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

    public async ping(): Promise<boolean> {
        return (await this.invoke('version', 6)) === 6
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
                    if (!Object.prototype.hasOwnProperty.call(response, 'error')) {
                        throw 'response is missing required error field'
                    }
                    if (!Object.prototype.hasOwnProperty.call(response, 'result')) {
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
