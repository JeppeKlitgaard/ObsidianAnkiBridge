import { NoteBase } from './base'
import { Media, NoteField, SourceDescriptor } from 'entities/note'
import yup from 'utils/yup'
import { Blueprint } from 'blueprints/base'

export const ConfigSchema = yup.object({
    id: yup.number().nullable().defined().default(null),
    deck: yup.string().emptyAsUndefined().nullAsUndefined(),
    tags: yup.array().of(yup.string().emptyAsUndefined().nullAsUndefined()),
    delete: yup.boolean().nullAsUndefined(),
    enabled: yup.boolean().nullAsUndefined(),
    cloze: yup.boolean().nullAsUndefined(),
})

export type Config = yup.Asserts<typeof ConfigSchema>

export class BasicNote extends NoteBase {
    constructor(
        blueprint: typeof Blueprint,
        id: number | null,
        frontlike: string,
        backlike: string,
        source: SourceDescriptor,
        sourceText: string,
        {
            deckName,
            tags,
            medias,
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
        super(
            blueprint,
            id,
            { [NoteField.Frontlike]: frontlike, [NoteField.Backlike]: backlike },
            source,
            sourceText,
            {
                deckName: deckName,
                tags: tags,
                medias: medias,
                delete_: delete_,
                enabled: enabled,
                isCloze: isCloze,
            },
        )
    }
}
