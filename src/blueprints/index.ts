import AnkiBridgePlugin from 'main'
import { App } from 'obsidian'
import { Blueprint } from './base'
import { SandwichBlueprint } from './sandwich'

type BlueprintConstructor = {
    new (app: App, plugin: AnkiBridgePlugin): Blueprint
} & typeof Blueprint

export const BLUEPRINTS: Array<BlueprintConstructor> = [SandwichBlueprint]

export function getBlueprintById(id: string): BlueprintConstructor {
    const result = BLUEPRINTS.find((o) => o.id === id)

    if (result === undefined) {
        throw new RangeError(`Blueprint with ID '${id}' not found.`)
    }

    return result
}
