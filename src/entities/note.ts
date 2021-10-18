import { NoteBase } from 'notes/base'
import { TFile } from 'obsidian'

export interface LineInterval {
    from: number
    to: number
}

export interface SourceDescriptor extends LineInterval {
    file: TFile
}

export interface Fragment {
    text: string
    sourceFile: TFile
    sourceOffset: number
}

export type FragmentProcessingResult = Array<NoteBase | Fragment>
