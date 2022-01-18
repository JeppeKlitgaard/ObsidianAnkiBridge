import { CodeBlockBlueprint } from './base'
import { MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownRenderer } from 'obsidian'
import { ParseConfig } from 'notes/base'
import { makeGrammar } from 'utils/grammar'
import basicCodeBlockGrammar from 'grammars/BasicCodeBlock.pegjs'
import { GRAMMAR_LIBRARIES } from 'consts'
import { generate } from 'peggy'
import _ from 'lodash'
import { YAMLException } from 'js-yaml'

export abstract class BasicCodeBlockBlueprint extends CodeBlockBlueprint {
    public readonly codeBlockLanguage: string = 'anki'
    static id = 'BasicCodeblock'
    static displayName = 'BasicCodeblock'
    static weight = 50

    protected async setupParser(): Promise<void> {
        const grammar = await makeGrammar(basicCodeBlockGrammar, GRAMMAR_LIBRARIES)
        this.parser = generate(grammar)
    }

    public async codeBlockProcessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
    ): Promise<void> {
        console.log('Source: ', source)
        console.log('El: ', el)
        console.log('Ctx: ', ctx)

        let card: MarkdownRenderChild

        try {
            const results = this.parser.parse(source)

            if (results.length !== 1) {
                card = await this.renderErrorCard(
                    el,
                    ctx,
                    'Invalid length of result. Report this to the author on GitHub',
                )
            } else {
                const result = results[0]
                const config = await ParseConfig.fromResult(result)

                card = await this.renderCard(el, ctx, config, result.front, result.back)
            }
        } catch (error) {
            console.warn(error)

            let msg: string
            if (error instanceof YAMLException) {
                msg = 'Invalid configuration: ' + error.message
            } else {
                msg = error
            }

            card = await this.renderErrorCard(el, ctx, msg)
        }

        el.replaceWith(card.containerEl)
    }
}
