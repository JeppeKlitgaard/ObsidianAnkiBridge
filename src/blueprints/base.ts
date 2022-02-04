import { Fragment, FragmentProcessingResult, SourceDescriptor } from 'ankibridge/entities/note'
import AnkiBridgePlugin from 'ankibridge/main'
import {
    NoteBase,
    ParseConfig,
    ParseLineResult,
    ParseLineResultSchema,
    ParseLocation,
    ParseNoteResult,
    ParseNoteResultSchema,
} from 'ankibridge/notes/base'
import { BasicNote } from 'ankibridge/notes/basic'
import { showError } from 'ankibridge/utils'
import yup from 'ankibridge/utils/yup'
import _ from 'lodash'
import {
    App,
    MarkdownPostProcessor,
    MarkdownPostProcessorContext,
    MarkdownPreviewRenderer,
    MarkdownRenderChild,
    MarkdownRenderer, MarkdownView, TFile,
} from 'obsidian'
import { Parser } from 'peggy'

export abstract class Blueprint {
    public static readonly displayName: string
    public static readonly id: string
    public static readonly weight: number
    public static readonly defaultConfigState: boolean

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
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

        let newFragment: Fragment = {
            text: '',
            sourceFile: fragment.sourceFile,
            sourceOffset: fragment.sourceOffset,
        }

        for (const result of results) {
            switch (result['type']) {
                case 'line': {
                    try {
                        const vResult: ParseLineResult = await ParseLineResultSchema.validate(
                            result,
                        )
                        newFragment.text += vResult.text
                    } catch (e) {
                        for (const error of e.errors) {
                            console.warn(error)
                            showError(error)
                        }
                    }
                    break
                }

                case 'note': {
                    // Assume location is good for now
                    const location: ParseLocation = result['location']
                    const from = location.start.line + fragment.sourceOffset
                    const to = location.end.line + fragment.sourceOffset

                    const source: SourceDescriptor = {
                        from: from,
                        to: to,
                        file: fragment.sourceFile,
                    }
                    const sourceText =
                        fragment.text
                            .split('\n')
                            .slice(from - 1, to - 1)
                            .join('\n') + '\n'

                    try {
                        const vResult: ParseNoteResult = await ParseNoteResultSchema.validate(
                            result,
                        )

                        const front = vResult.front
                        const back = vResult.back

                        const parseConfig = await ParseConfig.fromResult(vResult)
                        const { id, ...config } = parseConfig

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
                    } catch (e) {
                        if (e instanceof yup.ValidationError) {
                            for (const error of e.errors) {
                                console.warn(error)
                                showError(error)

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
                        } else {
                            throw e
                        }
                    }

                    break
                }

                default: {
                    throw EvalError('Something went wrong!')
                }
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

    protected codeblockParser: Parser

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
        const parent = el.parentElement!
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

        try {
            ctx.addChild(renderChild)
        } catch (e) {
            // Do nothing
            /* For some reason Obsidian will throw:

            TypeError: i.addChild is not a function
            at Object.addChild (app.js:1)
            at BasicCodeBlockBlueprint.createRenderChild (eval at <anonymous> (app.js:1), <anonymous>:23330:11)
            at BasicCodeBlockBlueprint.eval (eval at <anonymous> (app.js:1), <anonymous>:23367:32)
            at Generator.next (<anonymous>)
            at eval (eval at <anonymous> (app.js:1), <anonymous>:75:61)
            at new Promise (<anonymous>)
            at __async (eval at <anonymous> (app.js:1), <anonymous>:59:10)
            at BasicCodeBlockBlueprint.renderErrorCard (eval at <anonymous> (app.js:1), <anonymous>:23366:12)
            at BasicCodeBlockBlueprint.eval (eval at <anonymous> (app.js:1), <anonymous>:23527:27)
            at Generator.throw (<anonymous>)

            Sometimes. This must be an Obsidian Bug.
            */
        }

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
        cardEl.id = config.id?.toString() ?? ''

        const containerEl = cardEl.firstChild

        // Add config elements
        const prunedConfig = _.omitBy(config, _.isNil)
        if (!_.isEmpty(prunedConfig)) {
            const configEl = containerEl!.createDiv('ankibridge-card-config')
            Object.entries(prunedConfig).forEach(([key, value]) => {
                const entry = configEl.createSpan('ankibridge-card-config-entry')
                entry.setAttribute('data-type', key)
                entry.setAttribute('data-value', value)
                entry.innerText = value
            })
        }

        const fieldsEl = containerEl!.createDiv('ankibridge-card-fields')

        // Add front
        const frontEl = fieldsEl.createDiv('ankibridge-card-front ankibridge-card-content')
        MarkdownRenderer.renderMarkdown(front, frontEl, ctx.sourcePath, renderChild)
        this.includeImages(frontEl);

        // Add back
        if (back !== null) {
            const separatorEl = fieldsEl.createDiv('ankibridge-card-separator')

            const backEl = fieldsEl.createDiv('ankibridge-card-back ankibridge-card-content')
            MarkdownRenderer.renderMarkdown(back, backEl, ctx.sourcePath, renderChild)
            this.includeImages(backEl)
        }




        return renderChild
    }



    public includeImages(element: HTMLElement) {
        element.findAll(".internal-embed").forEach(el => {
            const src = el.getAttribute("src");
            const target = this.app.vault.getAbstractFileByPath("Attachments/" + src)
            if (target instanceof TFile && target.extension !== "md") {
                el.innerText = '';
                el.createEl("img", {attr: {src: this.app.vault.getResourcePath(target)}}, img => {
                    if (el.hasAttribute("width")) img.setAttribute("width", el.getAttribute("width")?? "")
                    if (el.hasAttribute("alt"))   img.setAttribute("alt",   el.getAttribute("alt")?? "")
                })
                el.addClasses(["image-embed", "is-loaded"]);
            }
        });
    }

    public async renderErrorCard(
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
        error: string,
    ): Promise<MarkdownRenderChild> {
        const renderChild = this.createRenderChild(el, ctx)

        const cardEl = renderChild.containerEl
        cardEl.addClass('error')

        const containerEl = cardEl.firstChild!

        const errorHeader = containerEl.createEl('h2')
        errorHeader.textContent = 'Card Error'

        const errorEl = containerEl.createSpan('error')
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
