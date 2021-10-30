import { NoteBase } from 'notes/base'
import { markdownLinkToTextAndHref } from 'utils'
import { Postprocessor, PostprocessorContext } from './base'

export class LinkPostprocessor extends Postprocessor {
    static id = 'LinkPostprocessor'
    static displayName = 'LinkPostprocessor'
    static weight = 50
    static defaultConfigState: true

    static linkRegex = /(\[\[.*?\]\])/g

    public process(note: NoteBase, text: string, ctx: PostprocessorContext): string {

        text = text.replace(LinkPostprocessor.linkRegex, (match, group1) => {
            const link = markdownLinkToTextAndHref(this.app.vault, group1)

            return `<a href="${link.uri}">${link.text}</a>`
        })

        return text
    }
}
