import { NoteBase } from './base'
import { SourceDescriptor } from 'entities/note'
import * as yup from 'yup'
import { Blueprint } from 'blueprints/base'

export const ConfigSchema = yup.object({
    id: yup.number().nullable(),
    deck: yup.string(),
    model: yup.string(),
    tags: yup.array().of(yup.string()),
    delete: yup.boolean(),
    enabled: yup.boolean(),
})

export type Config = yup.Asserts<typeof ConfigSchema>

export class BasicNote extends NoteBase {
    constructor(
        blueprint: typeof Blueprint,
        id: number | null,
        front: string,
        back: string,
        source: SourceDescriptor,
        sourceText: string,
        deckName?: string,
        modelName?: string,
        tags?: Array<string>,
        delete_?: boolean,
        enabled?: boolean,
    ) {
        super(
            blueprint,
            id,
            { front: front, back: back },
            source,
            sourceText,
            deckName,
            modelName,
            tags,
            delete_,
            enabled,
        )
    }

    // renderAsEntity(): NoteEntity {

    // }
    public static isValidateConfig(config: Record<string, any>): config is Config {
        // Check that it has ID
        if (!('id' in config)) {
            return false
        }
        if (typeof config['deck'] !== 'string') {
            return false
        }

        return true
    }

    renderAsText(): string {
        return this.blueprint.renderAsText(this)
    }
}
