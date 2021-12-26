import { NoteBase } from 'notes/base'
import { markdownLinkToTextAndHref } from 'utils'
import { Postprocessor, PostprocessorContext } from './base'

export class LinkToSourcePostprocessor extends Postprocessor {
    static id = 'LinkToSourcePostprocessor'
    static displayName = 'LinkToSourcePostprocessor'
    static weight = 50
    static defaultConfigState = true

    public process(note: NoteBase, text: string, ctx: PostprocessorContext): string {
        if (ctx.fieldName === 'Back') {
            const link = markdownLinkToTextAndHref(
                this.app.vault,
                `[[${note.source.file.name}|Source]]`,
            )

            const anchor = document.createElement('a')
            anchor.text = link.text
            anchor.href = link.uri

            text += `<br><p>🔗 ${anchor.outerHTML}</p>`
        }

        return text
    }
}
