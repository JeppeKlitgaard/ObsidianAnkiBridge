import { NoteBase } from 'notes/base'
import { TFile } from 'obsidian'
import { arrayBufferToBase64 } from 'utils/encoding'

export type Field = 'Front' | 'Back'

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
    Deleted,
    Updated,
    Skipped,
    Checked,
    NonFatalError,
}

export type MediaType = 'image' | 'video' | 'audio'

export class Media {
    constructor(public type: MediaType, public data: ArrayBuffer, public fields: Array<Field>) {}

    public async toBase64(): Promise<string> {
        return await arrayBufferToBase64(this.data)
    }
}
