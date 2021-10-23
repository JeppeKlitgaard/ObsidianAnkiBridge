import { DefaultDeckMap } from 'entities/other'

export interface ISettings {
    defaultModel: string
    tagInAnki: string
    foldersToIgnore: Array<string>

    fallbackDeck: string
    defaultDeckMaps: Array<DefaultDeckMap>

    blueprints: Record<string, boolean>
    postprocessors: Record<string, boolean>

    ankiConnectAddress: string
    ankiConnectPort: number

    debug: boolean
    debugNetwork: boolean
}

export const DEFAULT_SETTINGS: ISettings = {
    defaultModel: 'Basic',
    tagInAnki: 'obsidian',
    foldersToIgnore: [],

    fallbackDeck: 'Default',
    defaultDeckMaps: [],

    blueprints: {},
    postprocessors: {},

    ankiConnectAddress: '127.0.0.1',
    ankiConnectPort: 8765,

    debug: true,
    debugNetwork: false,
}
