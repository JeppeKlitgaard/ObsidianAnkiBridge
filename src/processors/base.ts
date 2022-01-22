import { NoteField } from 'ankibridge/entities/note'
import AnkiBridgePlugin from 'ankibridge/main'
import { App } from 'obsidian'

export abstract class Processor {
    public static readonly id: string
    public static readonly displayName: string

    /**
     * Lower is first
     */

    public static readonly weight: number

    public static readonly defaultConfigState: boolean
    public static readonly configurable: boolean = true

    constructor(public app: App, public plugin: AnkiBridgePlugin) {}
}

export interface ProcessorContext {
    noteField: NoteField
}
