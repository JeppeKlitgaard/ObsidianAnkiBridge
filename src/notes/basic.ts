import { Config, NoteBase } from './base'
import { Media, NoteField, SourceDescriptor } from 'entities/note'
import { Blueprint } from 'blueprints/base'

export class BasicNote extends NoteBase {
    constructor(
        blueprint: Blueprint,
        id: number | null,
        frontlike: string | null,
        backlike: string | null,
        source: SourceDescriptor,
        sourceText: string,
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
        super(
            blueprint,
            id,
            { [NoteField.Frontlike]: frontlike, [NoteField.Backlike]: backlike },
            source,
            sourceText,
            {
                config: config,
                medias: medias,
                isCloze: isCloze,
            },
        )
    }
}
