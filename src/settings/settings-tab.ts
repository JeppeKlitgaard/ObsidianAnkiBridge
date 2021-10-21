import { Notice, PluginSettingTab, Setting, App } from 'obsidian'
import { Anki } from 'services/anki'
import { BLUEPRINTS, getBlueprintById } from 'blueprints'
import AnkiBridgePlugin from 'main'
import { getPostprocessorById, POSTPROCESSORS } from 'postprocessors'

export class SettingsTab extends PluginSettingTab {
    constructor(public app: App, private plugin: AnkiBridgePlugin) {
        super(app, plugin)
    }

    display(): void {
        this.containerEl.empty()
        this.containerEl.createEl('h1', { text: this.plugin.manifest.name })

        this.addTester()
        this.addGeneral()
        this.addNetworking()
        this.addBlueprints()
        this.addPostprocessors()
    }

    addTester(): void {
        new Setting(this.containerEl)
            .setName('Test Anki Connection')
            .setDesc('Test that AnkiBridge is able to connect to Anki')
            .addButton((text) => {
                text.setButtonText('Test')
                    .setCta()
                    .onClick(() => {
                        new Anki(this.app, this.plugin)
                            .ping()
                            .then(
                                () =>
                                    new Notice(
                                        this.plugin.manifest.name + ': Connection succesful ✔',
                                    ),
                            )
                            .catch(
                                () =>
                                    new Notice(
                                        this.plugin.manifest.name + ': Connection failed ❌',
                                    ),
                            )
                    })
            })
    }

    addGeneral(): void {
        this.containerEl.createEl('h2', { text: 'General Settings' })

        new Setting(this.containerEl)
            .setName('Default deck')
            .setDesc(
                'The name of the default deck where the cards will be added when not specified.',
            )
            .addText((text) => {
                text.setValue(this.plugin.settings.defaultDeck)
                    .setPlaceholder('Deck::sub-deck')
                    .onChange((value) => {
                        if (value.length) {
                            this.plugin.settings.defaultDeck = value
                            this.plugin.saveSettings()
                        } else {
                            new Notice('The deck name must be at least 1 character long')
                        }
                    })
            })

        new Setting(this.containerEl)
            .setName('Default model')
            .setDesc(
                'The name of the default model used for new notes when the blueprint supports it.',
            )
            .addText((text) => {
                text.setValue(this.plugin.settings.defaultModel)
                    .setPlaceholder('Basic')
                    .onChange((value) => {
                        if (value.length) {
                            this.plugin.settings.defaultModel = value
                            this.plugin.saveSettings()
                        } else {
                            new Notice('The model name must be at least 1 character long')
                        }
                    })
            })

        new Setting(this.containerEl)
            .setName('Global tag')
            .setDesc('The tag to identify the flashcards in the notes.')
            .addText((text) => {
                text.setValue(this.plugin.settings.tagInAnki)
                    .setPlaceholder('Obsidian')
                    .onChange((value) => {
                        if (value) {
                            this.plugin.settings.tagInAnki = value.toLowerCase()
                            this.plugin.saveSettings()
                        } else {
                            new Notice('The tag must be at least 1 character long')
                        }
                    })
            })
    }

    addNetworking(): void {
        this.containerEl.createEl('h2', { text: 'Networking Settings' })

        new Setting(this.containerEl)
            .setName('AnkiConnect address')
            .setDesc('The address on which AnkiConnect is exposed. Usually `127.0.0.1`')
            .addText((text) => {
                text.setValue(this.plugin.settings.ankiConnectAddress)
                    .setPlaceholder('127.0.0.1')
                    .onChange((value) => {
                        if (value) {
                            this.plugin.settings.ankiConnectAddress = value
                            this.plugin.saveSettings()
                        } else {
                            new Notice('Please specify an address')
                        }
                    })
            })

        new Setting(this.containerEl)
            .setName('AnkiConnect port')
            .setDesc('The port on which AnkiConnect is exposed. Usually `8765`')
            .addText((text) => {
                text.setValue(String(this.plugin.settings.ankiConnectPort))
                    .setPlaceholder('8765')
                    .onChange((value) => {
                        if (value) {
                            this.plugin.settings.ankiConnectPort = Number(value)
                            this.plugin.saveSettings()
                        } else {
                            new Notice('Please specify a port')
                        }
                    })
            })
    }

    addBlueprints(): void {
        this.containerEl.createEl('h2', { text: 'Blueprint Settings' })

        const blueprintSettingsConst = Object.fromEntries(
            BLUEPRINTS.map((bp) => {
                return [bp.id, false]
            }),
        )

        const blueprintSettings: Record<string, boolean> = Object.assign(
            {},
            blueprintSettingsConst,
            this.plugin.settings.blueprints,
        )

        for (const [id, enabled] of Object.entries(blueprintSettings)) {
            const bp = getBlueprintById(id)
            new Setting(this.containerEl).setName(bp.displayName).addToggle((toggle) => {
                toggle.setValue(enabled).onChange((newState) => {
                    this.plugin.settings.blueprints[id] = newState
                    this.plugin.saveSettings()
                })
            })
        }
    }

    addPostprocessors(): void {
        this.containerEl.createEl('h2', { text: 'Postprocessor Settings' })

        const postprocessorSettingsConst = Object.fromEntries(
            POSTPROCESSORS.map((pp) => {
                return [pp.id, pp.defaultConfigState]
            }),
        )

        const postprocessorSettings: Record<string, boolean> = Object.assign(
            {},
            postprocessorSettingsConst,
            this.plugin.settings.postprocessors,
        )

        for (const [id, enabled] of Object.entries(postprocessorSettings)) {
            const pp = getPostprocessorById(id)
            new Setting(this.containerEl).setName(pp.displayName).addToggle((toggle) => {
                toggle.setValue(enabled).onChange((newState) => {
                    this.plugin.settings.postprocessors[id] = newState
                    this.plugin.saveSettings()
                })
            })
        }
    }
}
