import { NoteBase } from 'notes/base'
import { ProcessorContext } from 'processors/base'
import { escapeMarkdown } from 'utils'
import { Preprocessor } from './base'

export class MathPreprocessor extends Preprocessor {
    /**
     * Preprocesses inline and block math into an Anki-compatible format
     */
    static id = 'MathPreprocessor'
    static displayName = 'MathPreprocessor'
    static weight = 20
    static defaultConfigState = true

    public async preprocess(note: NoteBase, text: string, ctx: ProcessorContext): Promise<string> {
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
