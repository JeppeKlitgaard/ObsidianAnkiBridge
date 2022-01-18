import { NoteAction } from './note'

export interface SyncResult {
    noteActions: Array<NoteAction>
    fatalErrorString?: string
    fatalError: boolean
    totalFiles?: number
}

export interface DefaultDeckMap {
    folder: string
    deck: string
}
