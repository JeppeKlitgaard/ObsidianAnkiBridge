import { BLUEPRINTS } from 'ankibridge/blueprints'
import { LATEST_MIGRATION_VERSION } from 'ankibridge/consts'
import { DefaultDeckMap } from 'ankibridge/entities/other'
import { POSTPROCESSORS } from 'ankibridge/processors/postprocessors'
import { PREPROCESSORS } from 'ankibridge/processors/preprocessors'
import { Preprocessor } from 'ankibridge/processors/preprocessors/base'
import _ from 'lodash'

export interface ISettings {
    currentMigrationVersion: number

    tagInAnki: string
    inheritTags: boolean
    inheritDeck: boolean
    foldersToIgnore: Array<string>

    periodicPingEnabled: boolean
    periodicPingInterval: number

    fallbackDeck: string
    defaultDeckMaps: Array<DefaultDeckMap>

    blueprints: Record<string, boolean>
    processors: Record<string, boolean>

    ankiConnectAddress: string
    ankiConnectPort: number

    markToCloze: boolean
    deleteToCloze: boolean

    debug: boolean
    debugNetwork: boolean
}

// Prevent eslint from breaking code
// eslint-disable-next-line
export interface Settings extends ISettings {}
export class Settings {
    public getBlueprintSettings(): Record<string, boolean> {
        const blueprintSettingsConst = Object.fromEntries(
            BLUEPRINTS.map((bp) => {
                return [bp.id, bp.defaultConfigState]
            }),
        )

        const blueprintSettings: Record<string, boolean> = Object.assign(
            {},
            blueprintSettingsConst,
            this.blueprints,
        )

        return blueprintSettings
    }

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
    currentMigrationVersion: LATEST_MIGRATION_VERSION,

    tagInAnki: 'obsidian',
    inheritTags: true,
    foldersToIgnore: [],

    periodicPingEnabled: false,
    periodicPingInterval: 30, // Seconds

    fallbackDeck: 'Default',
    inheritDeck: true,
    defaultDeckMaps: [],

    blueprints: {},
    processors: {},

    ankiConnectAddress: '127.0.0.1',
    ankiConnectPort: 8765,

    markToCloze: true,
    deleteToCloze: true,

    debug: false,
    debugNetwork: false,
}
