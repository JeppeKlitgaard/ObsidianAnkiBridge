import { Fragment, FragmentProcessingResult } from 'entities/note'
import AnkiBridgePlugin from 'main'
import { NoteBase, ParseConfig } from 'notes/base'
import { App, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownRenderer } from 'obsidian'
import { generate, Parser } from 'peggy'
import { makeGrammar } from 'utils/grammar'
import ankiCodeBlockGrammar from 'grammars/AnkiCodeBlock.pegjs'
import { GRAMMAR_LIBRARIES } from 'consts'
import _ from 'lodash'

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

    public static renderAsText(note: NoteBase): string {
        throw Error('Not implemented!')
    }

    protected abstract setupParser(): Promise<void>

    public abstract processFragment(fragment: Fragment): Promise<FragmentProcessingResult>

    public configure(params: Partial<IBlueprintConfig>): void {
        this.config = { ...this.config, ...params }
    }

    // public abstract configureWithFrontmatter(frontmatter: FrontMatterCache): void
}

export abstract class CodeBlockBlueprint extends Blueprint {
    public static readonly codeBlockLanguage: string = 'anki'

    public static async renderCard(
        ctx: MarkdownPostProcessorContext,
        config: ParseConfig,
        front: string,
        back: string | null,
    ): Promise<MarkdownRenderChild> {
        const cardEl = createDiv('ankibridge-card')
        cardEl.id = config.id?.toString()

        const renderChild = new MarkdownRenderChild(cardEl)
        renderChild.containerEl = cardEl

        // These are intentionally empty for now
        /* eslint-disable @typescript-eslint/no-empty-function */
        renderChild.onload = () => {}
        renderChild.onunload = () => {}
        /* eslint-enable @typescript-eslint/no-empty-function */

        ctx.addChild(renderChild)

        // Add config elements
        const configEl = cardEl.createDiv('ankibridge-card-config')
        Object.entries(config).forEach(([key, value]) => {
            const entry = configEl.createSpan('ankibridge-card-config-entry')
            entry.setAttribute('data-type', key)
            entry.setAttribute('data-value', value)
            entry.innerText = value
        })

        const fieldsEl = cardEl.createDiv('ankibridge-card-fields')

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

    public static async codeBlockProcessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
    ) {
        console.log('Source: ', source)
        console.log('El: ', el)
        console.log('Ctx: ', ctx)

        const parser = await _.memoize(async () => {
            const grammar = await makeGrammar(ankiCodeBlockGrammar, GRAMMAR_LIBRARIES)
            const parser = generate(grammar)

            return parser
        })()

        const result = parser.parse(source)
        console.log('Result', result)

        const config = await ParseConfig.fromResult(result)

        console.log('Config', config)

        const parent = el.parentElement
        parent.addClass('ankibridge-card-parent')

        const card = await CodeBlockBlueprint.renderCard(ctx, config, result.front, result.back)
        el.replaceWith(card.containerEl)
    }
}

export interface IBlueprintConfig {
    deck: string
}

export const DefaultBlueprintConfig: IBlueprintConfig = {
    deck: 'Default',
}
