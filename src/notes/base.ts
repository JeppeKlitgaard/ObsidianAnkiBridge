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
import { load } from 'js-yaml'
import AnkiBridgePlugin from 'main'
import { getDefaultDeckForFolder } from 'utils/file'
import yup from 'utils/yup'

// Config
export interface Config {
    deck?: string
    tags?: Array<string>
    delete?: boolean
    enabled?: boolean
    cloze?: boolean
}

export interface ParseConfig extends Config {
    id: number | null
}
export class ParseConfig {
    public static async fromResult(result: ParseNoteResult): Promise<ParseConfig> {
        const configStr = result.config || ''
        const configObj: ParseConfig = <ParseConfig>load(configStr) || { id: null }

        const validatedConfig: ParseConfig = await ParseConfigSchema.validate(configObj)

        return validatedConfig
    }
}
export const ParseConfigSchema: yup.SchemaOf<ParseConfig> = yup.object({
    id: yup.number().nullable().defined().default(null),
    deck: yup.string().emptyAsUndefined().nullAsUndefined(),
    tags: yup.array().of(yup.string()).notRequired(),
    delete: yup.boolean().nullAsUndefined(),
    enabled: yup.boolean().nullAsUndefined(),
    cloze: yup.boolean().nullAsUndefined(),
})

// Location
export interface ParseLocationMarker {
    offset: number
    line: number
    column: number
}
export const ParseLocationMarkerSchema: yup.SchemaOf<ParseLocationMarker> = yup.object({
    offset: yup.number().defined(),
    line: yup.number().defined(),
    column: yup.number().defined(),
})

export interface ParseLocation {
    start: ParseLocationMarker
    end: ParseLocationMarker
    source?: string
}
export const ParseLocationSchema: yup.SchemaOf<ParseLocation> = yup.object({
    start: ParseLocationMarkerSchema,
    end: ParseLocationMarkerSchema,
    source: yup.string(),
})

// Result
export interface ParseLineResult {
    type: string
    text: string
}

export const ParseLineResultSchema: yup.SchemaOf<ParseLineResult> = yup.object({
    type: yup.string().defined(),
    text: yup.string().defined(),
})

export interface ParseNoteResult {
    type: string
    config: string | null
    front: string | null
    back: string | null
    location: ParseLocation
}
export const ParseNoteResultSchema: yup.SchemaOf<ParseNoteResult> = yup.object({
    type: yup.string().defined(),
    config: yup.string().nullable().defined(),
    front: yup.string().nullable().defined(),
    back: yup.string().nullable().defined(),
    location: ParseLocationSchema,
})

export abstract class NoteBase {
    public config: Config
    public medias: Array<Media>
    public isCloze: boolean

    constructor(
        public blueprint: Blueprint,
        public id: number | null,
        public fields: NoteFields,
        public source: SourceDescriptor,
        public sourceText: string,
        {
            config,
            medias = [],
            isCloze = false,
        }: {
            config: Config
            medias?: Array<Media>
            isCloze?: boolean
        },
    ) {
        this.config = config
        this.medias = medias
        this.isCloze = isCloze
    }

    public renderAsText(): string {
        return this.blueprint.renderAsText(this)
    }

    public fieldsToAnkiFields(fields: NoteFields): AnkiFields {
        if (this.isCloze) {
            return {
                Text: fields[NoteField.Frontlike] || '',
                'Back Extra': fields[NoteField.Backlike] || '',
            }
        }

        return { Front: fields[NoteField.Frontlike] || '', Back: fields[NoteField.Backlike] || '' }
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
        if (this.config.deck) {
            return this.config.deck
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

    public getTags(plugin: AnkiBridgePlugin): Array<string> {
        return [plugin.settings.tagInAnki, ...(this.config.tags || [])]
    }

    public getEnabled(): boolean {
        return this.config.enabled === undefined || this.config.enabled
    }
}

export interface NoteWithID extends NoteBase {
    id: number
}

export function hasID(note: NoteBase | NoteWithID): note is NoteWithID {
    return note.id !== null
}
