import { NoteField } from 'ankibridge/entities/note'
import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Postprocessor } from 'ankibridge/processors/postprocessors/base'

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

        targets.forEach((target) => {
            const content = target.textContent
            const cloze = `{{c${clozeIterator}::${content}}}`
            const clozeNode = document.createTextNode(cloze)

            target.replaceWith(clozeNode)

            clozeIterator++
        })

        if (clozeIterator !== 1) {
            note.isCloze = true
        }
    }
}
