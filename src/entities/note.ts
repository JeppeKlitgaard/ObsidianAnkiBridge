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

export type FragmentProcessingResult = Array<NoteBase | Fragment>
