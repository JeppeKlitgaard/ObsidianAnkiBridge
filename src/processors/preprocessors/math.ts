import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Preprocessor } from 'ankibridge/processors/preprocessors/base'
import { escapeMarkdown } from 'ankibridge/utils'

export class MathPreprocessor extends Preprocessor {
    /**
     * Preprocesses inline and block math into an Anki-compatible format
     */
    static id = 'MathPreprocessor'
    static displayName = 'MathPreprocessor'
    static weight = 20
    static defaultConfigState = true

    public async preprocess(
        note: NoteBase,
        strField: string | null,
        ctx: ProcessorContext,
    ): Promise<string | null> {
        if (strField !== null) {
            const mathBlockRegex = /\$\$(.*?)\$\$/gis
            strField = strField.replace(mathBlockRegex, (match, group1) => {
                return String.raw`\\(` + escapeMarkdown(group1) + String.raw` \\)`
            })

            const mathInlineRegex = /\$(.*?)\$/gi
            strField = strField.replace(mathInlineRegex, (match, group1) => {
                return String.raw`\\(` + escapeMarkdown(group1) + String.raw` \\)`
            })
        }

        return strField
    }
}
