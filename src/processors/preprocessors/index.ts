import AnkiBridgePlugin from 'ankibridge/main'
import { Preprocessor } from 'ankibridge/processors/preprocessors/base'
import {
    FinalDebugPreprocessor,
    InitialDebugPreprocessor,
} from 'ankibridge/processors/preprocessors/debug'
import { MathPreprocessor } from 'ankibridge/processors/preprocessors/math'
import { App } from 'obsidian'

export type PreprocessorConstructor = {
    new (app: App, plugin: AnkiBridgePlugin): Preprocessor
} & typeof Preprocessor

export const PREPROCESSORS: Array<PreprocessorConstructor> = [
    InitialDebugPreprocessor,
    FinalDebugPreprocessor,
    MathPreprocessor,
]

export function getPreprocessorById(id: string): PreprocessorConstructor {
    const result = PREPROCESSORS.find((o) => o.id === id)

    if (result === undefined) {
        throw new RangeError(`Preprocessor with ID '${id}' not found.`)
    }

    return result
}
