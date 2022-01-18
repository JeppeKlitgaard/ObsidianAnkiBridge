import { NoteBase } from 'notes/base'
import { TFile } from 'obsidian'
import { arrayBufferToBase64 } from 'utils/encoding'

export type AnkiBasicField = 'Front' | 'Back'
export type AnkiClozeField = 'Text' | 'Back Extra'
export type AnkiField = AnkiBasicField | AnkiClozeField

export type AnkiFields = Record<AnkiBasicField, string> | Record<AnkiClozeField, string>

export enum NoteField {
    Frontlike,
    Backlike,
}
export type NoteFields = Record<NoteField, string | null>

export type ModelName = 'Basic' | 'Cloze'

export interface SourceDescriptor {
    from: number
    to: number
    file: TFile
}

export interface Fragment {
    text: string
    sourceFile: TFile
    sourceOffset: number
}

export class FragmentProcessingResult extends Array<NoteBase | Fragment> {
    public renderAsText(): string {
        let text = ''

        for (const element of this) {
            if (!(element instanceof NoteBase)) {
                text += element['text']
                continue
            }

            text += element.renderAsText()
        }

        return text
    }
}

export enum NoteAction {
    Created,
    Recreated,
    Deleted,
    Updated,
    Skipped,
    Checked,
    NonFatalError,
}

export type MediaType = 'image' | 'video' | 'audio'

export class Media {
    constructor(
        public filename: string,
        public path: string,
        public type: MediaType,
        public data: ArrayBuffer,
        public fields: Array<NoteField>,
    ) {}

    public async toBase64(): Promise<string> {
        return await arrayBufferToBase64(this.data)
    }
}
