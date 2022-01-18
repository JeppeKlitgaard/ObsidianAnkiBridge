import AnkiBridgePlugin from 'main'
import { App } from 'obsidian'
import { Blueprint, CodeBlockBlueprint } from './base'
import { BasicCodeBlockBlueprint } from './basic-codeblock'
import { SandwichBlueprint } from './sandwich'

// TODO
// This could definite be made better, but advanced typing in TypeScript is
// Still a bit of a jungle to me.
type BlueprintConstructor = (new (app: App, plugin: AnkiBridgePlugin) => Blueprint) &
    typeof Blueprint

type CodeBlockBlueprintConstructor = (abstract new (
    app: App,
    plugin: AnkiBridgePlugin,
) => CodeBlockBlueprint) &
    typeof CodeBlockBlueprint

type AnyBlueprintConstructor = BlueprintConstructor | CodeBlockBlueprintConstructor

export const BLUEPRINTS: Array<AnyBlueprintConstructor> = [
    BasicCodeBlockBlueprint,
    SandwichBlueprint,
]

export function getBlueprintById(id: string): AnyBlueprintConstructor {
    const result = BLUEPRINTS.find((o) => o.id === id)

    if (result === undefined) {
        throw new RangeError(`Blueprint with ID '${id}' not found.`)
    }

    return result
}
