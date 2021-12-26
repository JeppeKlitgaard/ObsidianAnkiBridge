import { NoteBase } from 'notes/base'
import { MarkdownRenderer } from 'obsidian'
import { Postprocessor, PostprocessorContext } from './base'

export class DebugPostprocessor extends Postprocessor {
    static id = 'DebugPostprocessor'
    static displayName = 'DebugPostprocessor'
    static weight = 50
    static defaultConfigState = false

    public async process(note: NoteBase, text: string, ctx: PostprocessorContext): Promise<string> {
        console.log('Note: ', note)
        console.log('Text: ', text)
        console.log('Ctx: ', ctx)

        const el = createDiv('Temp')
        await MarkdownRenderer.renderMarkdown(text, el, '', null)

        console.log('el: ', el)
        // console.log('Rendered: ', rendered)

        return text
    }
}
