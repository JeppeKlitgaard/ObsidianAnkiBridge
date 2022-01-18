import { Blueprint } from 'blueprints/base'
import { GRAMMAR_LIBRARIES } from 'consts'
import { makeGrammar } from 'utils/grammar'
import { generate } from 'peggy'
import { NoteField } from 'entities/note'
import { dump } from 'js-yaml'
import { NoteBase } from 'notes/base'
import sandwichGrammar from 'grammars/CardSandwich.pegjs'

export class SandwichBlueprint extends Blueprint {
    static id = 'Sandwich'
    static displayName = 'Sandwich'
    static weight = 50

    protected async setupParser(): Promise<void> {
        const grammar = await makeGrammar(sandwichGrammar, GRAMMAR_LIBRARIES)

        this.parser = generate(grammar)
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
        str += '#anki/start\n'

        str += '```anki-config\n'
        str += config
        str += '```\n'

        str += front
        str += '#anki/---\n'

        str += back
        str += '#anki/end\n'

        return str
    }
}
