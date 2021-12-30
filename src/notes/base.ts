import { Blueprint } from 'blueprints/base'
import { NotesInfoResponseEntity } from 'entities/network'
import {
    AnkiFields,
    Media,
    ModelName,
    NoteField,
    NoteFields,
    SourceDescriptor,
} from 'entities/note'
import AnkiBridgePlugin from 'main'
import { getDefaultDeckForFolder } from 'utils/file'

export abstract class NoteBase {
    public deckName?: string
    public tags?: Array<string>
    public medias: Array<Media>
    public delete_?: boolean
    public enabled?: boolean
    public isCloze: boolean

    constructor(
        public blueprint: typeof Blueprint,
        public id: number | null,
        public fields: NoteFields,
        public source: SourceDescriptor,
        public sourceText: string,
        {
            deckName,
            tags,
            medias = [],
            delete_,
            enabled,
            isCloze = false,
        }: {
            deckName?: string
            tags?: Array<string>
            medias?: Array<Media>
            delete_?: boolean
            enabled?: boolean
            isCloze?: boolean
        },
    ) {
        this.deckName = deckName
        this.tags = tags
        this.medias = medias
        this.delete_ = delete_
        this.enabled = enabled
        this.isCloze = isCloze
    }

    public renderAsText(): string {
        return this.blueprint.renderAsText(this)
    }

    public fieldsToAnkiFields(fields: NoteFields): AnkiFields {
        if (this.isCloze) {
            return {
                Text: fields[NoteField.Frontlike],
                'Back Extra': fields[NoteField.Backlike],
            }
        }

        return { Front: fields[NoteField.Frontlike], Back: fields[NoteField.Backlike] }
    }

    public normaliseNoteInfoFields(noteInfo: NotesInfoResponseEntity): NoteFields {
        const isCloze = noteInfo.modelName === 'Cloze'

        const frontlike = isCloze ? 'Text' : 'Front'
        const backlike = isCloze ? 'Back Extra' : 'Back'

        return {
            [NoteField.Frontlike]: noteInfo.fields[frontlike].value,
            [NoteField.Backlike]: noteInfo.fields[backlike].value,
        }
    }

    public shouldUpdateFile(): boolean {
        return this.getEnabled() && this.renderAsText() !== this.sourceText
    }

    public getModelName(): ModelName {
        if (this.isCloze) {
            return 'Cloze'
        }

        return 'Basic'
    }

    /**
     * Returns the resolved deck name
     */
    public getDeckName(plugin: AnkiBridgePlugin): string {
        // Use in-note configured deck
        if (this.deckName) {
            return this.deckName
        }

        // Try to resolve based on default deck mappings
        const resolvedDefaultDeck = getDefaultDeckForFolder(
            this.source.file.parent,
            plugin.settings.defaultDeckMaps,
        )
        if (resolvedDefaultDeck) {
            return resolvedDefaultDeck
        }

        // Fallback if no deck was found
        return plugin.settings.fallbackDeck
    }

    public getEnabled(): boolean {
        return this.enabled === undefined || this.enabled
    }
}
