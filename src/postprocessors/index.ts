import AnkiBridgePlugin from 'main'
import { App } from 'obsidian'
import { Postprocessor } from './base'
import { HtmlPostprocessor } from './html'
import { LinkPostprocessor } from './link'
import { MathPostprocessor } from './math'

type PostprocessorConstructor = {
    new (app: App, plugin: AnkiBridgePlugin): Postprocessor
} & typeof Postprocessor

export const POSTPROCESSORS: Array<PostprocessorConstructor> = [
    MathPostprocessor,
    HtmlPostprocessor,
    LinkPostprocessor,
]

export function getPostprocessorById(id: string): PostprocessorConstructor {
    const result = POSTPROCESSORS.find((o) => o.id === id)

    if (result === undefined) {
        throw new RangeError(`Postprocessor with ID '${id}' not found.`)
    }

    return result
}
