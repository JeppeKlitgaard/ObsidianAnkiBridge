import { NoteBase } from 'notes/base'
import { TFile } from 'obsidian'

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
