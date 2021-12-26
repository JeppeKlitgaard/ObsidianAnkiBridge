import AnkiBridgePlugin from 'main'
import { NoteBase } from 'notes/base'
import { App } from 'obsidian'

export abstract class Postprocessor {
    public static readonly id: string
    public static readonly displayName: string
    public static readonly weight: number // Lower is first
    public static readonly defaultConfigState: boolean
    public static readonly configurable: boolean = true

    constructor(public app: App, public plugin: AnkiBridgePlugin) {}

    public abstract process(
        note: NoteBase,
        text: string,
        ctx: PostprocessorContext,
    ): Promise<string>
}

export interface PostprocessorContext {
    fieldName: string
}
