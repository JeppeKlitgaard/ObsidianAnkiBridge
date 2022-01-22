import { ProcessorContext } from 'ankibridge/processors/base'
import { Postprocessor } from 'ankibridge/processors/postprocessors/base'
import { markdownLinkToTextAndHref } from 'ankibridge/utils'

import { NoteField } from '../../entities/note'
import { NoteBase } from '../../notes/base'

export class LinkToSourcePostprocessor extends Postprocessor {
    static id = 'LinkToSourcePostprocessor'
    static displayName = 'LinkToSourcePostprocessor'
    static weight = 90
    static defaultConfigState = true

    public async postprocess(
        note: NoteBase,
        domField: HTMLTemplateElement,
        ctx: ProcessorContext,
    ): Promise<void> {
        if (ctx.noteField == NoteField.Backlike) {
            return
        }

        const link = markdownLinkToTextAndHref(
            this.app.vault,
            `[[${note.source.file.name}|Source]]`,
        )

        const anchor = createEl('a')
        anchor.text = link.text
        anchor.href = link.uri

        const linkParagraph = createEl('p')
        linkParagraph.textContent = '🔗 '
        linkParagraph.appendChild(anchor)

        domField.content.append(createEl('br'), linkParagraph)
    }
}
