export interface ISettings {
    defaultDeck: string
    defaultModel: string

    tagInAnki: string

    blueprints: Record<string, boolean>
    postprocessors: Record<string, boolean>

    ankiConnectAddress: string
    ankiConnectPort: number
    pollInterval: number

    debug: boolean
    debugNetwork: boolean
}

export const DEFAULT_SETTINGS: ISettings = {
    defaultDeck: 'Default',
    defaultModel: 'Basic',

    tagInAnki: 'obsidian',

    blueprints: {},
    postprocessors: {},

    ankiConnectAddress: '127.0.0.1',
    ankiConnectPort: 8765,
    pollInterval: 1000 * 10,  // ms

    debug: true,
    debugNetwork: false,
}
