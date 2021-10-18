import AnkiBridgePlugin from 'main'
import { App } from 'obsidian'

export abstract class Postprocessor {
    public static readonly id: string
    public static readonly displayName: string
    public static readonly weight: number // Lower is first

    constructor(public app: App, public plugin: AnkiBridgePlugin) {}

    public abstract process(text: string): string
}
