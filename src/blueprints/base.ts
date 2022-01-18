import { Fragment, FragmentProcessingResult } from 'entities/note'
import AnkiBridgePlugin from 'main'
import { NoteBase, ParseConfig } from 'notes/base'
import {
    App,
    MarkdownPostProcessor,
    MarkdownPostProcessorContext,
    MarkdownPreviewRenderer,
    MarkdownRenderChild,
    MarkdownRenderer,
} from 'obsidian'
import { Parser } from 'peggy'

import { SourceDescriptor } from 'entities/note'
import { showError } from 'utils'
import { BasicNote } from 'notes/basic'
export abstract class Blueprint {
    public static readonly displayName: string
    public static readonly id: string
    public static readonly weight: number

    protected app: App
    protected plugin: AnkiBridgePlugin

    protected parser: Parser

    protected config: IBlueprintConfig

    constructor(app: App, plugin: AnkiBridgePlugin) {
        this.app = app
        this.plugin = plugin

        this.config = DefaultBlueprintConfig
    }

    public async setup(): Promise<void> {
        await this.setupParser()
    }

    public async teardown(): Promise<void> {}

    public renderAsText(note: NoteBase): string {
        throw Error('Not implemented!')
    }

    protected abstract setupParser(): Promise<void>

    // Standard fragment processor, might need to overridden for some
    // blueprints
    // Could be turned into a mixin, but this is surprisingly non-trivial in TS
    public async processFragment(fragment: Fragment): Promise<FragmentProcessingResult> {
        const elements = new FragmentProcessingResult()

        const results: Array<Record<string, any>> = this.parser.parse(fragment.text)
        console.log(results)

        let newFragment: Fragment = {
            text: '',
            sourceFile: fragment.sourceFile,
            sourceOffset: fragment.sourceOffset,
        }

        for (const result of results) {
            if (result['type'] === 'line') {
                newFragment.text += result['text']
            }
            if (result['type'] === 'note') {
                const from: number = result['location']['start']['line'] + fragment.sourceOffset
                const to: number = result['location']['end']['line'] + fragment.sourceOffset
                const front: string = result['front']
                const back: string = result['back']
                let config: ParseConfig

                const source: SourceDescriptor = { from: from, to: to, file: fragment.sourceFile }
                const sourceText =
                    fragment.text
                        .split('\n')
                        .slice(from - 1, to - 1)
                        .join('\n') + '\n'

                // Validate configuration
                try {
                    config = await ParseConfig.fromResult(result)
                } catch (e) {
                    for (const error of e.errors) {
                        console.warn(error)
                        showError(error)
                    }

                    elements.push(newFragment)
                    newFragment = {
                        text: '',
                        sourceFile: fragment.sourceFile,
                        sourceOffset: to + 1,
                    }
                    // If invalid push back this part of the file as a whole fragment
                    elements.push({
                        text: sourceText,
                        sourceFile: fragment.sourceFile,
                        sourceOffset: from,
                    })

                    continue
                }

                const id = config.id
                delete config.id

                const note = new BasicNote(this, id, front, back, source, sourceText, {
                    config: config,
                })

                // Make new fragment
                elements.push(newFragment)
                newFragment = {
                    text: '',
                    sourceFile: fragment.sourceFile,
                    sourceOffset: to + 1,
                }
                elements.push(note)
            }
        }

        if (newFragment.text !== '') {
            elements.push(newFragment)
        }

        return elements
    }

    public configure(params: Partial<IBlueprintConfig>): void {
        this.config = { ...this.config, ...params }
    }
}

export abstract class CodeBlockBlueprint extends Blueprint {
    public readonly codeBlockLanguage: string
    private editorPostprocessor: MarkdownPostProcessor

    public async setup(): Promise<void> {
        await super.setup()

        // Setup editor postprocessor
        this.editorPostprocessor = this.plugin.registerMarkdownCodeBlockProcessor(
            this.codeBlockLanguage,
            this.codeBlockProcessor.bind(this),
        )
    }

    public async teardown(): Promise<void> {
        await super.teardown()
        MarkdownPreviewRenderer.unregisterPostProcessor(this.editorPostprocessor)
        //@ts-expect-error
        MarkdownPreviewRenderer.unregisterCodeBlockPostProcessor(this.codeBlockLanguage)
    }

    protected createRenderChild(
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
    ): MarkdownRenderChild {
        const parent = el.parentElement
        parent.addClass('ankibridge-card-parent')

        const cardEl = createDiv('ankibridge-card')

        const renderChild = new MarkdownRenderChild(cardEl)
        renderChild.containerEl = cardEl

        const containerEl = cardEl.createDiv('ankibridge-card-container')

        // These are intentionally empty for now
        /* eslint-disable @typescript-eslint/no-empty-function */
        renderChild.onload = () => {}
        renderChild.onunload = () => {}
        /* eslint-enable @typescript-eslint/no-empty-function */

        ctx.addChild(renderChild)

        return renderChild
    }

    public async renderCard(
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
        config: ParseConfig,
        front: string,
        back: string | null,
    ): Promise<MarkdownRenderChild> {
        const renderChild = this.createRenderChild(el, ctx)

        const cardEl = renderChild.containerEl
        cardEl.id = config.id?.toString()

        const containerEl = cardEl.firstChild

        // Add config elements
        const configEl = containerEl.createDiv('ankibridge-card-config')
        Object.entries(config).forEach(([key, value]) => {
            const entry = configEl.createSpan('ankibridge-card-config-entry')
            entry.setAttribute('data-type', key)
            entry.setAttribute('data-value', value)
            entry.innerText = value
        })

        const fieldsEl = containerEl.createDiv('ankibridge-card-fields')


        // Add front
        const frontEl = fieldsEl.createDiv('ankibridge-card-front')
        MarkdownRenderer.renderMarkdown(front, frontEl, ctx.sourcePath, renderChild)

        // Add back
        if (back !== null) {
            const separatorEl = fieldsEl.createDiv('ankibridge-card-separator')

            const backEl = fieldsEl.createDiv('ankibridge-card-back')
            MarkdownRenderer.renderMarkdown(back, backEl, ctx.sourcePath, renderChild)
        }

        return renderChild
    }

    public async renderErrorCard(
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
        error: string,
    ): Promise<MarkdownRenderChild> {
        const renderChild = this.createRenderChild(el, ctx)

        const cardEl = renderChild.containerEl
        cardEl.addClass('error')

        const containerEl = cardEl.firstChild

        const errorHeader = containerEl.createEl("h2")
        errorHeader.textContent = "Card Error"

        const errorEl = containerEl.createSpan("error")
        errorEl.textContent = error

        return renderChild
    }

    public abstract codeBlockProcessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
    ): Promise<void>
}

export interface IBlueprintConfig {
    deck: string
}

export const DefaultBlueprintConfig: IBlueprintConfig = {
    deck: 'Default',
}
