import { CodeBlockBlueprint } from './base'
import { MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian'
import { NoteBase, ParseConfig } from 'notes/base'
import { makeGrammar } from 'utils/grammar'
import basicCodeBlockGrammar from 'grammars/BasicCodeBlock.pegjs'
import basicCodeBlockProcessorGrammar from 'grammars/BasicCodeBlockProcessor.pegjs'
import { GRAMMAR_LIBRARIES } from 'consts'
import { generate } from 'peggy'
import { YAMLException, dump } from 'js-yaml'
import { NoteField } from 'entities/note'

export abstract class BasicCodeBlockBlueprint extends CodeBlockBlueprint {
    public readonly codeBlockLanguage: string = 'anki'
    static id = 'BasicCodeblock'
    static displayName = 'BasicCodeblock'
    static weight = 50

    protected async setupParser(): Promise<void> {
        const grammar = await makeGrammar(basicCodeBlockGrammar, GRAMMAR_LIBRARIES)
        this.parser = generate(grammar)

        const codeblockGrammar = await makeGrammar(
            basicCodeBlockProcessorGrammar,
            GRAMMAR_LIBRARIES,
        )
        this.codeblockParser = generate(codeblockGrammar)
    }

    public renderAsText(note: NoteBase): string {
        const front = note.fields[NoteField.Frontlike]
        const back = note.fields[NoteField.Backlike]

        const config = dump({
            id: note.id,
            deck: note.config.deck,
            tags: note.config.tags,
            delete: note.config.delete,
            enabled: note.config.enabled,
            cloze: note.config.cloze,
        })

        let str = ''

        str += '```anki\n'

        str += config

        str += '---\n'
        str += front

        if (back !== null) {
            str += '===\n'
            str += back
        }

        str += '```\n'

        return str
    }

    public async codeBlockProcessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
    ): Promise<void> {
        let card: MarkdownRenderChild

        try {
            const result = this.codeblockParser.parse(source)
            console.log('RESULT', result)

            const config = await ParseConfig.fromResult(result)

            card = await this.renderCard(el, ctx, config, result.front, result.back)
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
