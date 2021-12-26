import { NoteBase } from 'notes/base'
import { markdownLinkToTextAndHref } from 'utils'
import { Postprocessor, PostprocessorContext } from './base'

export class DebugPostprocessor extends Postprocessor {
    static id = 'DebugPostprocessor'
    static displayName = 'DebugPostprocessor'
    static weight = 50
    static defaultConfigState = false

    public process(note: NoteBase, text: string, ctx: PostprocessorContext): string {
        console.log("Note: ", note)
        console.log("Text: ", text)
        console.log("Ctx: ", ctx)

        return text
    }
}
