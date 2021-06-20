export interface ISettings {
    contextAwareMode: boolean
    sourceSupport: boolean
    codeHighlightSupport: boolean
    contextSeparator: string
    deck: string
    flashcardsTag: string

    ankiConnectAddress: string
    ankiConnectPort: number
}

export const DEFAULT_SETTINGS: ISettings = {
    contextAwareMode: true,
    sourceSupport: false,
    codeHighlightSupport: false,
    contextSeparator: ' > ',
    deck: 'Default',
    flashcardsTag: 'card',

    ankiConnectAddress: '127.0.0.1',
    ankiConnectPort: 8765,
}
