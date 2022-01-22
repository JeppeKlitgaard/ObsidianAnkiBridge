import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Postprocessor } from 'ankibridge/processors/postprocessors/base'

export abstract class DebugPostprocessor extends Postprocessor {
    static defaultConfigState = false

    public async postprocess(
        note: NoteBase,
        domField: HTMLTemplateElement,
        ctx: ProcessorContext,
    ): Promise<void> {
        console.log('Note: ', note)
        console.log('DomField: ', domField)
        console.log('Ctx: ', ctx)
    }
}

export class InitialDebugPostprocessor extends DebugPostprocessor {
    static id = 'InitialDebugPostprocessor'
    static displayName = 'InitialDebugPostprocessor'
    static weight = 0
}

export class FinalDebugPostprocessor extends DebugPostprocessor {
    static id = 'FinalDebugPostprocessor'
    static displayName = 'FinalDebugPostprocessor'
    static weight = 100
}
