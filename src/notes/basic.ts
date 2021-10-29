import { NoteBase } from './base'
import { SourceDescriptor } from 'entities/note'
import yup from 'utils/yup'
import { Blueprint } from 'blueprints/base'

export const ConfigSchema = yup.object({
    id: yup.number().nullable().defined().default(null),
    deck: yup.string().emptyAsUndefined().nullAsUndefined(),
    model: yup.string().emptyAsUndefined().nullAsUndefined(),
    tags: yup.array().of(yup.string().emptyAsUndefined().nullAsUndefined()),
    delete: yup.boolean().nullAsUndefined(),
    enabled: yup.boolean().nullAsUndefined(),
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

    renderAsText(): string {
        return this.blueprint.renderAsText(this)
    }
}
