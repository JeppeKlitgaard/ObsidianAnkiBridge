import AnkiBridgePlugin from 'ankibridge/main'
import { Postprocessor } from 'ankibridge/processors/postprocessors/base'
import { ClozePostprocessor } from 'ankibridge/processors/postprocessors/cloze'
import {
    FinalDebugPostprocessor,
    InitialDebugPostprocessor,
} from 'ankibridge/processors/postprocessors/debug'
import { LinkPostprocessor } from 'ankibridge/processors/postprocessors/link'
import { LinkToSourcePostprocessor } from 'ankibridge/processors/postprocessors/link-to-source'
import { MediaPostprocessor } from 'ankibridge/processors/postprocessors/media'
import { App } from 'obsidian'

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
