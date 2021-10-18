export interface ISettings {
    contextAwareMode: boolean
    sourceSupport: boolean
    codeHighlightSupport: boolean
    contextSeparator: string
    deck: string
    flashcardsTag: string

    defaultDeck: string
    defaultModel: string

    tagInAnki: string

    blueprints: Record<string, boolean>
    postprocessors: Record<string, boolean>

    ankiConnectAddress: string
    ankiConnectPort: number

    debug: boolean
    debugNetwork: boolean
}

export const DEFAULT_SETTINGS: ISettings = {
    contextAwareMode: true,
    sourceSupport: false,
    codeHighlightSupport: false,
    contextSeparator: ' > ',
    deck: 'Default',
    flashcardsTag: 'card',

    defaultDeck: 'Default',
    defaultModel: 'Basic',

    tagInAnki: 'obsidian',

    blueprints: {},
    postprocessors: {},

    ankiConnectAddress: '127.0.0.1',
    ankiConnectPort: 8765,

    debug: true,
    debugNetwork: false,
}
