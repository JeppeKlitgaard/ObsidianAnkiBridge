import AnkiBridgePlugin from 'main'
import MarkdownIt from 'markdown-it'
import { App } from 'obsidian'
import { Postprocessor } from './base'

export class HtmlPostprocessor extends Postprocessor {
    static id = 'HtmlPostprocessor'
    static displayName = 'HtmlPostprocessor'
    static weight = 60
    static defaultConfigState: true

    private markdownit: MarkdownIt

    constructor(app: App, plugin: AnkiBridgePlugin) {
        super(app, plugin)

        this.markdownit = new MarkdownIt({
            html: true,
            xhtmlOut: false,
            breaks: true,
            linkify: true,
        })

        this.markdownit.use(MarkdownIt)
    }

    public process(text: string): string {
        return this.markdownit.render(text)
    }
}
