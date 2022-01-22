import { NoteBase } from '../../notes/base'
import { Processor, ProcessorContext } from '../base'

export abstract class Postprocessor extends Processor {
    public abstract postprocess(
        note: NoteBase,
        domField: HTMLTemplateElement,
        ctx: ProcessorContext,
    ): Promise<void>
}
