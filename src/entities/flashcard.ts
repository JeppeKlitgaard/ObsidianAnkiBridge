import { codeDeckExtension, sourceDeckExtension } from 'consts'
import { Card } from 'entities/card'

export class Flashcard extends Card {
    constructor(
        id = -1,
        deckName: string,
        initialContent: string,
        fields: Record<string, string>,
        reversed: boolean,
        endOffset: number,
        tags: string[] = [],
        inserted = false,
        mediaNames: string[],
        containsCode: boolean,
    ) {
        super(
            id,
            deckName,
            initialContent,
            fields,
            reversed,
            endOffset,
            tags,
            inserted,
            mediaNames,
            containsCode,
        )
        this.modelName = this.reversed ? `Obsidian-basic-reversed` : `Obsidian-basic`
        if (fields['Source']) {
            this.modelName += sourceDeckExtension
        }
        if (containsCode) {
            this.modelName += codeDeckExtension
        }
    }
}
