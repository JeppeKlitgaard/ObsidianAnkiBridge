import { NoteBase } from 'ankibridge/notes/base'
import { Processor, ProcessorContext } from 'ankibridge/processors/base'

export abstract class Preprocessor extends Processor {
    public abstract preprocess(
        note: NoteBase,
        strField: string | null,
        ctx: ProcessorContext,
    ): Promise<string | null>
}
