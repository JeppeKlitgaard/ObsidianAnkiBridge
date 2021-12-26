import AnkiBridgePlugin from 'main'
import { App } from 'obsidian'
import { Preprocessor } from './base'
import { FinalDebugPreprocessor, InitialDebugPreprocessor } from './debug'
import { MathPreprocessor } from './math'

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
