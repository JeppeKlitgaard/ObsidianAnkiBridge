import { NoteAction } from './note'

export interface SyncResult {
    noteActions: Array<NoteAction>
    fatalErrorString?: string
    fatalError: boolean
}

export interface DefaultDeckMap {
    folder: string
    deck: string
}
