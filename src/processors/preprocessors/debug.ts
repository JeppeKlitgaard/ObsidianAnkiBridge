import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Preprocessor } from 'ankibridge/processors/preprocessors/base'

export abstract class DebugPreprocessor extends Preprocessor {
    static defaultConfigState = false

    public async preprocess(
        note: NoteBase,
        strField: string | null,
        ctx: ProcessorContext,
    ): Promise<string | null> {
        console.log('Note: ', note)
        console.log('StrField: ', strField)
        console.log('Ctx: ', ctx)
        return strField
    }
}

export class InitialDebugPreprocessor extends DebugPreprocessor {
    static id = 'InitialDebugPreprocessor'
    static displayName = 'InitialDebugPreprocessor'
    static weight = 0
}

export class FinalDebugPreprocessor extends DebugPreprocessor {
    static id = 'FinalDebugPreprocessor'
    static displayName = 'FinalDebugPrepProcessor'
    static weight = 100
}
