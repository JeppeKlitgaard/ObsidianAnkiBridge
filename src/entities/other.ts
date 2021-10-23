export interface SyncResult {
    fatalErrorString?: string
    fatalError: boolean
    numberOfNonFatalErrors: number
}

export interface DefaultDeckMap {
    folder: string
    deck: string
}
