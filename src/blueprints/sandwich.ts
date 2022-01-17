import { FullNoteBlueprint } from 'blueprints/base'
import { GRAMMAR_LIBRARIES } from 'consts'
import { makeGrammar } from 'utils/grammar'
import { generate } from 'peggy'
import { BasicNote } from 'notes/basic'
import { SourceDescriptor, Fragment, FragmentProcessingResult, NoteField } from 'entities/note'
import { dump, load } from 'js-yaml'
import { showError } from 'utils'
import { NoteBase, ParseConfig, ParseConfigSchema } from 'notes/base'
import sandwichGrammar from 'grammars/CardSandwich.pegjs'

export class SandwichBlueprint extends FullNoteBlueprint {
    static id = 'Sandwich'
    static displayName = 'Sandwich'
    static weight = 50

    protected async setupParser(): Promise<void> {
        const grammar = await makeGrammar(sandwichGrammar, GRAMMAR_LIBRARIES)

        this.parser = generate(grammar)
    }

    public processFragment(fragment: Fragment): FragmentProcessingResult {
        const elements = new FragmentProcessingResult()

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
                let config: ParseConfig = load(result['config']) || {}

                const source: SourceDescriptor = { from: from, to: to, file: fragment.sourceFile }
                const sourceText =
                    fragment.text
                        .split('\n')
                        .slice(from - 1, to - 1)
                        .join('\n') + '\n'

                // Validate configuration
                try {
                    config = ParseConfigSchema.validateSync(config) as ParseConfig
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

                const note = new BasicNote(SandwichBlueprint, id, front, back, source, sourceText, {
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

    public static renderAsText(note: NoteBase): string {
        let str = ''
        str += '#anki/start\n'

        str += '```anki\n'
        str += dump({
            id: note.id,
            deck: note.config.deck,
            tags: note.config.tags,
            delete: note.config.delete_,
            enabled: note.config.enabled,
            cloze: note.config.cloze,
        })
        str += '```\n'

        str += note.fields[NoteField.Frontlike]
        str += '#anki/---\n'

        str += note.fields[NoteField.Backlike]
        str += '#anki/end\n'

        return str
    }
}
