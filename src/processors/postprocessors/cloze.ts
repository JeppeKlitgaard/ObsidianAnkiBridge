import { NoteField } from 'ankibridge/entities/note'
import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Postprocessor } from 'ankibridge/processors/postprocessors/base'

const processClozeReplacement = (raw: string): [RegExp | string, string] => {
    // regex, e.g.: /foobar/g
    const regexModeMatching = raw.match(/^\/(.*?)\/(.?)$/)
    if (regexModeMatching) {
        const pattern = regexModeMatching[1]
        const flags = regexModeMatching[2]
        const replaceValue = "$1"
        return [new RegExp(`(${pattern})`, flags), replaceValue]
    }

    // regex with specified replace value, e.g.: /foo(bar)/g, $1
    const regexWithReplaceValueModeMatching = raw.match(/^\/(.*?)\/(.?),\s+(.*?)$/)
    if (regexWithReplaceValueModeMatching) {
        const pattern = regexWithReplaceValueModeMatching[1]
        const flags = regexWithReplaceValueModeMatching[2]
        const replaceValue = regexWithReplaceValueModeMatching[3]
        return [new RegExp(pattern, flags), replaceValue]
    }

    // raw text, e.g.: r"/123/"
    const textModeMatching = raw.match(/^r"(.*?)"$/)
    if (textModeMatching) {
        return [textModeMatching[1], textModeMatching[1]]
    }

    // text, e.g.: 123
    return [raw, raw]
}

export class ClozePostprocessor extends Postprocessor {
    static id = 'ClozePostprocessor'
    static displayName = 'ClozePostprocessor'
    static weight = 70
    static defaultConfigState = true

    public async postprocess(
        note: NoteBase,
        domField: HTMLTemplateElement,
        ctx: ProcessorContext,
    ): Promise<void> {
        // Clozes are only specified on frontlike field
        if (ctx.noteField != NoteField.Frontlike || note.config.cloze === false) {
            return
        }

        let clozeIterator = 1
        let targets: Array<HTMLElement> = []

        if (this.plugin.settings.markToCloze) {
            targets = targets.concat(Array.from(domField.content.querySelectorAll('mark')))
        }
        if (this.plugin.settings.deleteToCloze) {
            targets = targets.concat(Array.from(domField.content.querySelectorAll('del')))
        }

        console.log("domField", domField)

        targets.forEach((target) => {
            const content = target.textContent
            const cloze = `{{c${clozeIterator}::${content}}}`
            const clozeNode = document.createTextNode(cloze)

            console.log("cloze", clozeNode)
            console.log("target", target)

            target.replaceWith(clozeNode)

            clozeIterator++
        })

        if (note.config.clozeReplacements) {
            const clozeReplacements = note.config.clozeReplacements
            for (const replacement of clozeReplacements) {
                const [searchValue, replaceValue] = processClozeReplacement(replacement)

                console.log("tuple", searchValue, replaceValue)
                console.log("domField2", domField)
                domField.innerHTML = domField.innerHTML.replaceAll(searchValue, `{{c${clozeIterator}::${replaceValue}}}`)
                clozeIterator++
            }
        }

        if (clozeIterator !== 1) {
            note.isCloze = true
        }
    }
}
