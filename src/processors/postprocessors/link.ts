import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Postprocessor } from 'ankibridge/processors/postprocessors/base'
import { renderObsidianURIOpen } from 'ankibridge/utils'

export class LinkPostprocessor extends Postprocessor {
    static id = 'LinkPostprocessor'
    static displayName = 'LinkPostprocessor'
    static weight = 70
    static defaultConfigState = true

    public async postprocess(
        note: NoteBase,
        domField: HTMLTemplateElement,
        ctx: ProcessorContext,
    ): Promise<void> {
        const links = domField.content.querySelectorAll('a.internal-link')
        links.forEach((link) => {
            link.removeAttribute('target')
            link.removeAttribute('class')
            link.removeAttribute('data-href')
            link.removeAttribute('aria-label')
            link.removeAttribute('rel')

            link.setAttribute(
                'href',
                renderObsidianURIOpen(this.app.vault, link.getAttribute('href') || undefined),
            )
        })
    }
}
