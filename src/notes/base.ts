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

export const ParseConfigSchema = yup.object({
    id: yup.number().nullable().defined().default(null),
    deck: yup.string().emptyAsUndefined().nullAsUndefined(),
    tags: yup.array().of(yup.string().emptyAsUndefined().nullAsUndefined()),
    delete: yup.boolean().nullAsUndefined(),
    enabled: yup.boolean().nullAsUndefined(),
    cloze: yup.boolean().nullAsUndefined(),
})

export interface Config {
    deck?: string
    tags?: Array<string>
    delete_?: boolean
    enabled?: boolean
    cloze?: boolean
}

export interface ParseConfig extends Config {
    id?: number
}
export class ParseConfig {
    public static async fromResult(result: Record<string, any>): Promise<ParseConfig> {
        const configStr = result['config']
        const configObj: ParseConfig = load(configStr) || {}

        const validatedConfig = (await ParseConfigSchema.validate(configObj)) as ParseConfig

        return validatedConfig
    }
}

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
