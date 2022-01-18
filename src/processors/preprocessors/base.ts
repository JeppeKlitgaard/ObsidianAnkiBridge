import { NoteBase } from 'notes/base'
import { Processor, ProcessorContext } from 'processors/base'

export abstract class Preprocessor extends Processor {
    public abstract preprocess(
        note: NoteBase,
        strField: string | null,
        ctx: ProcessorContext,
    ): Promise<string | null>
}
