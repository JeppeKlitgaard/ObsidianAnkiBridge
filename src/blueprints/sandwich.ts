import { Blueprint } from 'blueprints/base'
import { GRAMMAR_LIBRARIES } from 'consts'
import { makeGrammar } from 'utils/grammar'
import { generate } from 'peggy'
import { BasicNote, ConfigSchema } from 'notes/basic'
import { SourceDescriptor, Fragment, FragmentProcessingResult } from 'entities/note'
import { dump, load } from 'js-yaml'
import { showError } from 'utils'
import { NoteBase } from 'notes/base'
import sandwichGrammar from 'grammars/CardSandwich.pegjs'

export class SandwichBlueprint extends Blueprint {
    static id = 'Sandwich'
    static displayName = 'Sandwich'
    static weight = 50

    protected async setupParser(): Promise<void> {
        const grammar = await makeGrammar(
            sandwichGrammar,
            GRAMMAR_LIBRARIES,
        )

        this.parser = generate(grammar)
    }

    public processFragment(fragment: Fragment): FragmentProcessingResult {
        const elements: Array<BasicNote | Fragment> = []

        const results: Array<Record<string, any>> = this.parser.parse(fragment.text)

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
                let config: Record<string, any> = load(result['config']) || {}

                const source: SourceDescriptor = { from: from, to: to, file: fragment.sourceFile }
                const sourceText =
                    fragment.text
                        .split('\n')
                        .slice(from - 1, to - 1)
                        .join('\n') + '\n'

                // Validate configuration
                try {
                    config = ConfigSchema.validateSync(config)
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

                const note = new BasicNote(
                    SandwichBlueprint,
                    config.id,
                    front,
                    back,
                    source,
                    sourceText,
                    config.deck,
                    config.model,
                    config.tags,
                    config.delete,
                )

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

    public static renderAsText(note: NoteBase): string {
        let str = ''
        str += '#anki/start\n'

        str += '```anki\n'
        str += dump({
            id: note.id,
            deck: note.deckName,
            model: note.modelName,
            tags: note.tags,
            delete: note.delete_,
            enabled: note.enabled,
        })
        str += '```\n'

        str += note.fields['front']
        str += '#anki/---\n'

        str += note.fields['back']
        str += '#anki/end\n'

        return str
    }
}
