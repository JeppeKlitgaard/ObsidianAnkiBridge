export interface FileProcessingResult {
    nonFatalErrors: number
    notesProcessed: number
    notesSynced: number
}

export interface SyncResult extends FileProcessingResult {
    fatalErrorString?: string
    fatalError: boolean
}

export interface DefaultDeckMap {
    folder: string
    deck: string
}
