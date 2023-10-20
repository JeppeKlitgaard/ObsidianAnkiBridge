import { CodeBlockBlueprint } from 'ankibridge/blueprints/base'
import { GRAMMAR_LIBRARIES } from 'ankibridge/consts'
import { NoteField } from 'ankibridge/entities/note'
import basicCodeBlockGrammar from 'ankibridge/grammars/BasicCodeBlock.pegjs'
import basicCodeBlockProcessorGrammar from 'ankibridge/grammars/BasicCodeBlockProcessor.pegjs'
import { NoteBase, ParseConfig } from 'ankibridge/notes/base'
import { makeGrammar } from 'ankibridge/utils/grammar'
import { dump, YAMLException } from 'js-yaml'
import { MarkdownPostProcessorContext, MarkdownRenderChild } from 'obsidian'
import { generate } from 'peggy'

export class BasicCodeBlockBlueprint extends CodeBlockBlueprint {
    public static readonly id = 'BasicCodeblock'
    public static readonly displayName = 'BasicCodeblock'
    public static readonly weight = 50
    public static readonly defaultConfigState = true

    public readonly codeBlockLanguage: string = 'anki'

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
            reversed: note.config.reversed,
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
