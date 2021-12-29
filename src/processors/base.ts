import { Field } from 'entities/note'
import AnkiBridgePlugin from 'main'
import { App } from 'obsidian'

export abstract class Processor {
    public static readonly id: string
    public static readonly displayName: string

    /**
     * Lower is first
     * HTML conversion is at weight=50
     * Thus <50 is rendered while still in Markdown
     * and >50 is rendered when converted to HTML
     */

    public static readonly weight: number

    public static readonly defaultConfigState: boolean
    public static readonly configurable: boolean = true

    constructor(public app: App, public plugin: AnkiBridgePlugin) {}
}

export interface ProcessorContext {
    fieldName: Field
}
