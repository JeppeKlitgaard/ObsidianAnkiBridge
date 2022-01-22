import { PostprocessorConstructor, POSTPROCESSORS } from 'ankibridge/processors/postprocessors'
import { PreprocessorConstructor, PREPROCESSORS } from 'ankibridge/processors/preprocessors'

export function getProcessorById(id: string): PreprocessorConstructor | PostprocessorConstructor {
    const result = [...PREPROCESSORS, ...POSTPROCESSORS].find((o) => o.id === id)

    if (result === undefined) {
        throw new RangeError(`Processor with ID '${id}' not found.`)
    }

    return result
}
