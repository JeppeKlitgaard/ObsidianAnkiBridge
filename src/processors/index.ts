import { PostprocessorConstructor, POSTPROCESSORS } from './postprocessors'
import { PreprocessorConstructor, PREPROCESSORS } from './preprocessors'

export function getProcessorById(id: string): PreprocessorConstructor | PostprocessorConstructor {
    const result = [...PREPROCESSORS, ...POSTPROCESSORS].find((o) => o.id === id)

    if (result === undefined) {
        throw new RangeError(`Processor with ID '${id}' not found.`)
    }

    return result
}
