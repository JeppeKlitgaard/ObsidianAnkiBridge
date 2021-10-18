import { Fragment, FragmentProcessingResult } from 'entities/note'
import AnkiBridgePlugin from 'main'
import { NoteBase } from 'notes/base'
import { App } from 'obsidian'
import { Parser } from 'peggy'
import { Postprocessor } from 'postprocessors/base'

export abstract class Blueprint {
    public static readonly displayName: string
    public static readonly id: string
    public static readonly weight: number

    protected app: App
    protected plugin: AnkiBridgePlugin

    protected parser: Parser

    protected config: IBlueprintConfig
    protected postProcessors: Postprocessor[]

    constructor(app: App, plugin: AnkiBridgePlugin) {
        this.app = app
        this.plugin = plugin

        this.config = DefaultBlueprintConfig
    }

    public async setup(): Promise<void> {
        await this.setupParser()
    }

    public static renderAsText(note: NoteBase): string {
        throw Error('Not implemented!')
    }

    protected abstract setupParser(): Promise<void>

    public abstract processFragment(fragment: Fragment): FragmentProcessingResult

    public configure(params: Partial<IBlueprintConfig>): void {
        this.config = { ...this.config, ...params }
    }

    // public abstract configureWithFrontmatter(frontmatter: FrontMatterCache): void
}

export interface IBlueprintConfig {
    deck: string
}

export const DefaultBlueprintConfig: IBlueprintConfig = {
    deck: 'Default',
}
