import { Notice, PluginSettingTab, Setting, App, ButtonComponent } from 'obsidian'
import { Anki } from 'services/anki'
import { BLUEPRINTS, getBlueprintById } from 'blueprints'
import AnkiBridgePlugin from 'main'
import { FolderSuggest } from 'suggesters/folder-suggester'
import { logError } from 'log'
import { AnkiBridgeError } from 'error'
import { arraymove } from 'utils/array'
import { getProcessorById } from 'processors'

export class SettingsTab extends PluginSettingTab {
    constructor(public app: App, private plugin: AnkiBridgePlugin) {
        super(app, plugin)
    }

    display(): void {
        this.containerEl.empty()
        this.containerEl.createEl('h1', { text: this.plugin.manifest.name })

        this.addTester()
        this.addGeneral()
        this.addDefaultDeck()
        this.addNetworking()
        this.addBlueprints()
        this.addProcessors()
        this.addDebugging()
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

        // Periodic ping
        const periodicPingDesc = document.createDocumentFragment()
        periodicPingDesc.append(
            'Pings Anki periodically at the set interval in seconds.',
            document.createElement('br'),
            'Note: Due to a shortcoming in Electron this will produce a lot of errors',
            'in console when pings are failing. These are harmless and safe to ignore, ',
            'but cannot be suppresed.',
        )
        new Setting(this.containerEl)
            .setName('Periodic ping')
            .setDesc(periodicPingDesc)
            .addText((e) => {
                e.setValue(String(this.plugin.settings.periodicPingInterval))
                e.setPlaceholder('Seconds')
                e.inputEl.style.marginRight = '20px'
                e.onChange((value) => {
                    const interval = Number(value)
                    if ((isNaN(interval) && value) || interval < 0.0) {
                        this.display()
                        return
                    }

                    if (interval === 0) {
                        return
                    }

                    this.plugin.settings.periodicPingInterval = interval
                    this.plugin.saveSettings()
                    this.plugin.setupPeriodicPing()
                })
            })
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.periodicPingEnabled).onChange((newState) => {
                    this.plugin.settings.periodicPingEnabled = newState
                    this.plugin.saveSettings()
                    this.plugin.setupPeriodicPing()
                })
            })

        // Folders to ignore
        new Setting(this.containerEl)
            .setName('Add New')
            .setDesc('Add new folder to ignore.')
            .addButton((button: ButtonComponent): ButtonComponent => {
                const b = button
                    .setTooltip('Add additional folder to ignore')
                    .setButtonText('+')
                    .setCta()
                    .onClick(() => {
                        this.plugin.settings.foldersToIgnore.push('')
                        this.display()
                    })

                return b
            })

        this.plugin.settings.foldersToIgnore.forEach((folder, index) => {
            const s = new Setting(this.containerEl)
                .addSearch((cb) => {
                    new FolderSuggest(this.app, cb.inputEl)
                    cb.setPlaceholder('Folder')
                        .setValue(folder)
                        .onChange(async (newFolder) => {
                            this.plugin.settings.foldersToIgnore[index] = newFolder
                            await this.plugin.saveSettings()
                        })
                    // @ts-ignore
                    cb.containerEl.addClass('ankibridge-search')
                })
                .addExtraButton((cb) => {
                    cb.setIcon('up-chevron-glyph')
                        .setTooltip('Move up')
                        .onClick(async () => {
                            arraymove(this.plugin.settings.foldersToIgnore, index, index - 1)
                            await this.plugin.saveSettings()
                            this.display()
                        })
                })
                .addExtraButton((cb) => {
                    cb.setIcon('down-chevron-glyph')
                        .setTooltip('Move down')
                        .onClick(async () => {
                            arraymove(this.plugin.settings.foldersToIgnore, index, index + 1)
                            await this.plugin.saveSettings()
                            this.display()
                        })
                })
                .addExtraButton((cb) => {
                    cb.setIcon('cross')
                        .setTooltip('Delete')
                        .onClick(async () => {
                            this.plugin.settings.foldersToIgnore.splice(index, 1)
                            await this.plugin.saveSettings()
                            this.display()
                        })
                })

            s.infoEl.remove()
        })
    }

    addDefaultDeck(): void {
        this.containerEl.createEl('h2', { text: 'Default Deck Mapping' })

        const logicDesc = document.createElement('ol')
        const logicsDesc = [
            'Value specified by deck key of in-note config',
            'Deepest match specified in mappings below',
            'Fallback deck',
        ]

        logicsDesc.forEach((value) => {
            const li = document.createElement('li')
            li.innerText = value
            logicDesc.appendChild(li)
        })

        const descHeading = document.createDocumentFragment()
        descHeading.append(
            'Default decks are mapped based on the following logic, using the first match:',
            logicDesc,
        )

        new Setting(this.containerEl).setDesc(descHeading)

        new Setting(this.containerEl)
            .setName('Fallback deck')
            .setDesc(
                'The name of the deck where the cards will be added when no folder mapping could be found.',
            )
            .addText((text) => {
                text.setValue(this.plugin.settings.fallbackDeck)
                    .setPlaceholder('deck::subdeck')
                    .onChange((value) => {
                        if (value.length) {
                            this.plugin.settings.fallbackDeck = value
                            this.plugin.saveSettings()
                        } else {
                            new Notice('The deck name must be at least 1 character long')
                        }
                    })
            })

        new Setting(this.containerEl)
            .setName('Add New')
            .setDesc('Add new default deck map')
            .addButton((button: ButtonComponent) => {
                button
                    .setTooltip('Add additional default deck map')
                    .setButtonText('+')
                    .setCta()
                    .onClick(() => {
                        this.plugin.settings.defaultDeckMaps.push({
                            folder: '',
                            deck: '',
                        })
                        this.plugin.saveSettings()
                        this.display()
                    })
            })

        this.plugin.settings.defaultDeckMaps.forEach((defaultDeckMap, index) => {
            const s = new Setting(this.containerEl)
                .addSearch((cb) => {
                    new FolderSuggest(this.app, cb.inputEl)
                    cb.setPlaceholder('Folder')
                        .setValue(defaultDeckMap.folder)
                        .onChange((newFolder) => {
                            if (
                                newFolder &&
                                this.plugin.settings.defaultDeckMaps.some(
                                    (e) => e.folder == newFolder,
                                )
                            ) {
                                logError(
                                    new AnkiBridgeError(
                                        `${newFolder} already has a deck associated with it`,
                                    ),
                                )
                                cb.setValue('')
                                return
                            }

                            this.plugin.settings.defaultDeckMaps[index].folder = newFolder
                            this.plugin.saveSettings()
                        })
                    // @ts-ignore
                    cb.containerEl.addClass('ankibridge-search')
                })
                .addText((text) => {
                    text.setValue(defaultDeckMap.deck)
                        .setPlaceholder('deck::subdeck')
                        .onChange((newDeck) => {
                            this.plugin.settings.defaultDeckMaps[index].deck = newDeck
                        })
                })
                .addExtraButton((cb) => {
                    cb.setIcon('up-chevron-glyph')
                        .setTooltip('Move up')
                        .onClick(() => {
                            arraymove(this.plugin.settings.defaultDeckMaps, index, index - 1)
                            this.plugin.saveSettings()
                            this.display()
                        })
                })
                .addExtraButton((cb) => {
                    cb.setIcon('down-chevron-glyph')
                        .setTooltip('Move down')
                        .onClick(() => {
                            arraymove(this.plugin.settings.defaultDeckMaps, index, index + 1)
                            this.plugin.saveSettings()
                            this.display()
                        })
                })
                .addExtraButton((cb) => {
                    cb.setIcon('cross')
                        .setTooltip('Delete')
                        .onClick(() => {
                            this.plugin.settings.defaultDeckMaps.splice(index, 1)
                            this.plugin.saveSettings()
                            this.display()
                        })
                })
            s.infoEl.remove()
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

    addProcessors(): void {
        this.containerEl.createEl('h2', { text: 'Processor Settings' })

        const processorSettings = this.plugin.settings.getMergedProcessors()

        const descHeading = document.createDocumentFragment()
        descHeading.append(
            `Processors are responsible for converting the raw markdown from Obsidian into
            Anki-compatible HTML.`,
        )
        descHeading.appendChild(createEl('br'))
        descHeading.append('Preprocessors act on Markdown-formatted text.')
        descHeading.appendChild(createEl('br'))
        descHeading.append('Postprocessors act on an HTML DOM tree.')

        new Setting(this.containerEl).setDesc(descHeading)

        for (const [id, enabled] of Object.entries(processorSettings)) {
            const pp = getProcessorById(id)
            new Setting(this.containerEl).setName(pp.displayName).addToggle((toggle) => {
                toggle
                    .setValue(enabled)
                    .setDisabled(!pp.configurable)
                    .onChange((newState) => {
                        this.plugin.settings.processors[id] = newState
                        this.plugin.saveSettings()
                        this.plugin.initiateServices()
                    })
            })
        }
    }

    addDebugging(): void {
        this.containerEl.createEl('h2', { text: 'Debugging Settings' })

        new Setting(this.containerEl)
            .setName('Enabling debug logging')
            .setDesc('Useful when developing or reporting errors to the developers.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.debug).onChange((newState) => {
                    this.plugin.settings.debug = newState
                    this.plugin.saveSettings()
                })
            })

        new Setting(this.containerEl)
            .setName('Enabling networking debug logging')
            .setDesc('Useful when developing or reporting errors to the developers.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.debugNetwork).onChange((newState) => {
                    this.plugin.settings.debugNetwork = newState
                    this.plugin.saveSettings()
                })
            })
    }
}
