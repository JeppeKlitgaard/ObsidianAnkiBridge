import AnkiBridgePlugin from 'main'
import { App } from 'obsidian'
import { LinkToSourcePostprocessor } from './link-to-source'
import { Postprocessor } from './base'
import { LinkPostprocessor } from './link'
import { FinalDebugPostprocessor, InitialDebugPostprocessor } from './debug'
import { MediaPostprocessor } from './media'
import { ClozePostprocessor } from './cloze'

export type PostprocessorConstructor = {
    new (app: App, plugin: AnkiBridgePlugin): Postprocessor
} & typeof Postprocessor

export const POSTPROCESSORS: Array<PostprocessorConstructor> = [
    InitialDebugPostprocessor,
    FinalDebugPostprocessor,
    LinkPostprocessor,
    MediaPostprocessor,
    LinkToSourcePostprocessor,
    ClozePostprocessor,
]

export function getPostprocessorById(id: string): PostprocessorConstructor {
    const result = POSTPROCESSORS.find((o) => o.id === id)

    if (result === undefined) {
        throw new RangeError(`Postprocessor with ID '${id}' not found.`)
    }

    return result
}
