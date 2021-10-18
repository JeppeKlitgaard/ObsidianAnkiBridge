import { Notice, PluginSettingTab, Setting, App } from 'obsidian'
import { Anki } from 'services/anki'
import { pluginName } from 'consts'
import { BLUEPRINTS, getBlueprintById } from 'blueprints'
import AnkiBridgePlugin from 'main'
import { getPostprocessorById, POSTPROCESSORS } from 'postprocessors'

export class SettingsTab extends PluginSettingTab {
    constructor(public app: App, private plugin: AnkiBridgePlugin) {
        super(app, plugin)
    }

    display(): void {
        const { containerEl } = this
        const plugin = (this as any).plugin

        containerEl.empty()
        containerEl.createEl('h1', { text: pluginName })

        new Setting(containerEl)
            .setName('Test Anki Connection')
            .setDesc('Test that AnkiBridge is able to connect to Anki')
            .addButton((text) => {
                text.setButtonText('Test').onClick(() => {
                    Anki.fromSettings(plugin.settings)
                        .ping()
                        .then(() => new Notice(pluginName + ': Connection succesful'))
                        .catch(() => new Notice(pluginName + ': Connection failed'))
                })
            })

        // General settings
        containerEl.createEl('h2', { text: 'General Settings' })

        new Setting(containerEl)
            .setName('Context-aware mode')
            .setDesc('Add the ancestor headings to the question of the flashcard.')
            .addToggle((toggle) =>
                toggle.setValue(plugin.settings.contextAwareMode).onChange((value) => {
                    plugin.settings.contextAwareMode = value
                    plugin.saveData(plugin.settings)
                }),
            )

        new Setting(containerEl)
            .setName('Source support')
            .setDesc(
                'Add to every card the source, i.e. the link to the original card. NOTE: Old cards made without source support cannot be updated.',
            )
            .addToggle((toggle) =>
                toggle.setValue(plugin.settings.sourceSupport).onChange((value) => {
                    plugin.settings.sourceSupport = value
                    plugin.saveData(plugin.settings)
                }),
            )

        new Setting(containerEl)
            .setName('Code highlight support')
            .setDesc('Add highlight of the code in Anki.')
            .addToggle((toggle) =>
                toggle.setValue(plugin.settings.codeHighlightSupport).onChange((value) => {
                    plugin.settings.codeHighlightSupport = value
                    plugin.saveData(plugin.settings)
                }),
            )

        new Setting(containerEl)
            .setName('Default deck')
            .setDesc(
                'The name of the default deck where the cards will be added when not specified.',
            )
            .addText((text) => {
                text.setValue(plugin.settings.deck)
                    .setPlaceholder('Deck::sub-deck')
                    .onChange((value) => {
                        if (value.length) {
                            plugin.settings.deck = value
                            plugin.saveData(plugin.settings)
                        } else {
                            new Notice('The deck name must be at least 1 character long')
                        }
                    })
            })

        new Setting(containerEl)
            .setName('Flashcards #tag')
            .setDesc('The tag to identify the flashcards in the notes (case-insensitive).')
            .addText((text) => {
                text.setValue(plugin.settings.flashcardsTag)
                    .setPlaceholder('Card')
                    .onChange((value) => {
                        if (value) {
                            plugin.settings.flashcardsTag = value.toLowerCase()
                            plugin.saveData(plugin.settings)
                        } else {
                            new Notice('The tag must be at least 1 character long')
                        }
                    })
            })

        // Advanced settings
        containerEl.createEl('h2', { text: 'Advanced Settings' })

        new Setting(containerEl)
            .setName('AnkiConnect address')
            .setDesc('The address on which AnkiConnect is exposed. Usually `127.0.0.1`')
            .addText((text) => {
                text.setValue(plugin.settings.ankiConnectAddress)
                    .setPlaceholder('127.0.0.1')
                    .onChange((value) => {
                        if (value) {
                            plugin.settings.ankiConnectAddress = value
                            plugin.saveData(plugin.settings)
                        } else {
                            new Notice('Please specify an address')
                        }
                    })
            })

        new Setting(containerEl)
            .setName('AnkiConnect port')
            .setDesc('The port on which AnkiConnect is exposed. Usually `8765`')
            .addText((text) => {
                text.setValue(plugin.settings.ankiConnectPort)
                    .setPlaceholder('8765')
                    .onChange((value) => {
                        if (value) {
                            plugin.settings.ankiConnectPort = value
                            plugin.saveData(plugin.settings)
                        } else {
                            new Notice('Please specify a port')
                        }
                    })
            })

        this.addBlueprints()
        this.addPostprocessors()
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
                return [pp.id, false]
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
