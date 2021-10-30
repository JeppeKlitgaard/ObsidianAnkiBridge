import { Blueprint } from 'blueprints/base'
import { FieldEntity } from 'entities/network'
import { SourceDescriptor } from 'entities/note'
import AnkiBridgePlugin from 'main'
import { getDefaultDeckForFolder } from 'utils/file'

export abstract class NoteBase {
    constructor(
        public blueprint: typeof Blueprint,
        public id: number | null,
        public fields: Record<string, string>,
        public source: SourceDescriptor,
        public sourceText: string,
        public deckName?: string,
        public modelName?: string,
        public tags?: Array<string>,
        public delete_?: boolean,
        public enabled?: boolean,
    ) {}

    // public abstract renderAsEntity(): NoteEntity
    public abstract renderAsText(): string

    public renderFields(): Record<string, string> {
        return { Front: this.fields['front'], Back: this.fields['back'] }
    }

    public normaliseNoteInfoFields(fields: Record<string, FieldEntity>): Record<string, string> {
        return { Front: fields['Front'].value, Back: fields['Back'].value }
    }

    public shouldUpdateFile(): boolean {
        return this.renderAsText() !== this.sourceText
    }

    /**
     * Returns the resolved deck name
     */
    public getDeckName(plugin: AnkiBridgePlugin): string {
        // Use in-note configured deck
        if (this.deckName) {
            return this.deckName
        }

        // Try to resolve based on default deck mappings
        const resolvedDefaultDeck = getDefaultDeckForFolder(
            this.source.file.parent,
            plugin.settings.defaultDeckMaps,
        )
        if (resolvedDefaultDeck) {
            return resolvedDefaultDeck
        }

        // Fallback if no deck was found
        return plugin.settings.fallbackDeck
    }
}
