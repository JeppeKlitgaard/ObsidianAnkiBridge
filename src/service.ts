import { ISettings } from 'settings/settings'
import { App, TFile } from 'obsidian'
import AnkiBridgePlugin from 'main'
import { Anki } from 'services/anki'
import { Blueprint } from 'blueprints/base'
import { SandwichBlueprint } from 'blueprints/sandwich'

export class BridgeService {
    private app: App
    private plugin: AnkiBridgePlugin
    private anki: Anki
    private blueprints: Blueprint[]

    constructor(app: App, plugin: AnkiBridgePlugin) {
        this.app = app
        this.plugin = plugin

        this.anki = Anki.fromSettings(this.plugin.settings)

        // Instanciate Blueprints
        // TODO
        this.blueprints = [new SandwichBlueprint(this.app, this.plugin)]
    }

    private async assertAnki(): Promise<boolean> {
        try {
            await this.anki.ping()
            return true
        } catch (err) {
            this.plugin.error('Could not connect to Anki')
            return false
        }
    }

    public async processFile(file: TFile) {
        if (!this.assertAnki()) {
            return
        }

        for (const blueprint of this.blueprints) {
            // blueprint.processFile(file)
        }
    }
}
