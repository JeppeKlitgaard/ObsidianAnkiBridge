import { NoteBase } from 'notes/base'
import { escapeMarkdown } from 'utils'
import { Postprocessor, PostprocessorContext } from './base'

export class MathPostprocessor extends Postprocessor {
    static id = 'MathPostprocessor'
    static displayName = 'MathPostprocessor'
    static weight = 40
    static defaultConfigState = true

    public async process(note: NoteBase, text: string, ctx: PostprocessorContext): Promise<string> {
        const mathBlockRegex = /\$\$(.*?)\$\$/gis
        text = text.replace(mathBlockRegex, (match, group1) => {
            return String.raw`\\(` + escapeMarkdown(group1) + String.raw` \\)`
        })

        const mathInlineRegex = /\$(.*?)\$/gi
        text = text.replace(mathInlineRegex, (match, group1) => {
            return String.raw`\\(` + escapeMarkdown(group1) + String.raw` \\)`
        })

        return text
    }
}
