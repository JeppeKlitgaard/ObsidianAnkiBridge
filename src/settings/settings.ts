import { DefaultDeckMap } from 'entities/other'
import _ from 'lodash'
import { POSTPROCESSORS } from 'processors/postprocessors'
import { PREPROCESSORS } from 'processors/preprocessors'
import { Preprocessor } from 'processors/preprocessors/base'

export interface ISettings {
    defaultModel: string
    tagInAnki: string
    foldersToIgnore: Array<string>

    periodicPingEnabled: boolean
    periodicPingInterval: number

    fallbackDeck: string
    defaultDeckMaps: Array<DefaultDeckMap>

    blueprints: Record<string, boolean>
    processors: Record<string, boolean>

    ankiConnectAddress: string
    ankiConnectPort: number

    debug: boolean
    debugNetwork: boolean
}

// Prevent eslint from breaking code
// eslint-disable-next-line
export interface Settings extends ISettings {}
export class Settings {
    public getMergedProcessors(): Record<string, boolean> {
        const processors = [...PREPROCESSORS, ...POSTPROCESSORS]

        const processorSettingsConst = Object.fromEntries(
            _.sortBy(processors, [
                (o) => {
                    if (o.prototype instanceof Preprocessor) {
                        return 0
                    } else {
                        return 1
                    }
                },
                'weight',
            ]).map((pp) => {
                return [pp.id, pp.defaultConfigState]
            }),
        )

        // Override those that are not configurable, just in case
        const processorSettingsOverrides = Object.fromEntries(
            processors
                .filter((pp) => {
                    return !pp.configurable
                })
                .map((pp) => {
                    return [pp.id, pp.defaultConfigState]
                }),
        )

        const processorSettings: Record<string, boolean> = Object.assign(
            {},
            processorSettingsConst,
            this.processors,
            processorSettingsOverrides,
        )

        return processorSettings
    }
}

export const DEFAULT_SETTINGS: ISettings = {
    defaultModel: 'Basic',
    tagInAnki: 'obsidian',
    foldersToIgnore: [],

    periodicPingEnabled: false,
    periodicPingInterval: 30, // Seconds

    fallbackDeck: 'Default',
    defaultDeckMaps: [],

    blueprints: {},
    processors: {},

    ankiConnectAddress: '127.0.0.1',
    ankiConnectPort: 8765,

    debug: false,
    debugNetwork: false,
}
