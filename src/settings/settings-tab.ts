import { getBlueprintById } from 'ankibridge/blueprints'
import { DOCUMENTATION_URL } from 'ankibridge/consts'
import { RequestPermissionResponse } from 'ankibridge/entities/network'
import { AnkiBridgeError } from 'ankibridge/error'
import { logError } from 'ankibridge/log'
import AnkiBridgePlugin from 'ankibridge/main'
import supportHtml from 'ankibridge/settings/support.html'
import { App, ButtonComponent, Notice, PluginSettingTab, Setting } from 'obsidian'

import { getProcessorById } from '../processors'
import { FolderSuggest } from '../suggesters/folder-suggester'
import { arraymove } from '../utils/array'

export class SettingsTab extends PluginSettingTab {
    constructor(public app: App, private plugin: AnkiBridgePlugin) {
        super(app, plugin)
    }

    display(): void {
        this.containerEl.empty()
        this.containerEl.createEl('h1', { text: this.plugin.manifest.name })

        this.addVersion()
        this.addDocumentation()
        this.addInitialSetup()
        this.addTester()
        this.addSupport()
        this.addGeneral()
        this.addDefaultDeck()
        this.addNetworking()
        this.addBlueprints()
        this.addProcessors()
        this.addProcessorConfig()
        this.addDebugging()
    }

    addVersion(): void {
        new Setting(this.containerEl)
            .setName(`AnkiBridge Version: ${this.plugin.manifest.version}`)
            .setDesc('The current AnkiBridge.')
    }

    addDocumentation(): void {
        new Setting(this.containerEl)
            .setName('Open Documentation')
            .setDesc('Open the documentation for AnkiBridge.')
            .addButton((text) => {
                text.setButtonText('Documentation')
                    .setCta()
                    .onClick(() => {
                        open(DOCUMENTATION_URL)
                    })
            })
    }

    addInitialSetup(): void {
        const descFragment = createFragment()
        descFragment.append(
            'You only need to do this once, but you must have Anki open and AnkiConnect installed.',
            createEl('br'),
            'See Documentation > Insallation if in doubt.',
        )
        new Setting(this.containerEl)
            .setName('Perform Initial Anki Setup')
            .setDesc(descFragment)
            .addButton((text) => {
                text.setButtonText('Setup')
                    .setCta()
                    .onClick(async () => {
                        const initalNoticeFrag = createFragment()

                        initalNoticeFrag.createEl('p').innerHTML =
                            this.plugin.manifest.name + 'Setting up Anki Connection…'
                        initalNoticeFrag.createEl('p').innerHTML =
                            'Please press <code>YES</code> on the Anki pop-up.'

                        const initialNotice = new Notice(initalNoticeFrag, 0)

                        let response: RequestPermissionResponse | undefined
                        try {
                            response = await this.plugin.anki.requestPermission()
                        } catch (e) {
                            this.plugin.error('During Anki setup this error was raised: ', e)
                        }

                        initialNotice.hide()
                        this.plugin.debug('Anki Setup Response: ', response)

                        if (response?.permission === 'granted') {
                            new Notice(this.plugin.manifest.name + ': Setup successful ✔')
                        } else {
                            const frag = createFragment()
                            frag.createEl('p').innerHTML =
                                this.plugin.manifest.name + ': Setup failed ❌'
                            frag.createEl('p').innerHTML = 'Please refer to the documentation'

                            new Notice(frag)
                        }
                    })
            })
    }

    addTester(): void {
        new Setting(this.containerEl)
            .setName('Test Anki Connection')
            .setDesc('Test that AnkiBridge is able to connect to Anki.')
            .addButton((text) => {
                text.setButtonText('Test')
                    .setCta()
                    .onClick(async () => {
                        try {
                            const notice = new Notice(
                                this.plugin.manifest.name + ': Testing connection …',
                            )
                            await this.plugin.anki.ping()
                            notice.hide()

                            new Notice(this.plugin.manifest.name + ': Connection successful ✔')
                        } catch (e) {
                            new Notice(this.plugin.manifest.name + ': Connection failed ❌')
                        }
                    })
            })
    }

    addSupport(): void {
        this.containerEl.createEl('h2', { text: '❤ Support Me?' })
        const container = this.containerEl.createDiv('ankibridge-settings-support')

        const template = createEl('template')
        template.innerHTML = supportHtml.trim()

        const donateButton = template.content.firstChild!

        const donateText = container.createDiv('ankibridge-setting-support-text')
        donateText.createEl('p', {
            text: 'Developing AnkiBridge was no small feat and it is (proudly) made available free of charge.',
        })

        const plea = donateText.createEl('p')
        plea.innerHTML =
            'If you <b>want to </b> and <b>are able to</b>, you can throw a much-needed coffee or a much-appreciated coin my way on Ko-fi.'

        const wishes = donateText.createEl('p')
        wishes.innerHTML = 'All the best,<br><em>Jeppe</em>'

        container.appendChild(donateButton)
    }

    addGeneral(): void {
        this.containerEl.createEl('h2', { text: 'General Settings' })

        new Setting(this.containerEl)
            .setName('Global Tag')
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

        // Folders to ignore
        new Setting(this.containerEl)
            .setName('Folders To Ignore')
            .setDesc('Add new folder to ignore when syncing notes.')
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

        const logicDesc = createEl('ol')
        const logicsDesc = [
            'Value specified by deck key of in-note config',
            'Deepest match specified in mappings below',
            'Fallback deck',
        ]

        logicsDesc.forEach((value) => {
            const li = createEl('li')
            li.innerText = value
            logicDesc.appendChild(li)
        })

        const descHeading = createFragment()
        descHeading.append(
            'Default decks are mapped based on the following logic, using the first match:',
            logicDesc,
        )

        new Setting(this.containerEl).setDesc(descHeading)

        new Setting(this.containerEl)
            .setName('Fallback Deck')
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
            .setName('AnkiConnect Address')
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
            .setName('AnkiConnect Port')
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

        // Periodic ping
        const periodicPingDesc = createFragment()
        periodicPingDesc.append(
            'Pings Anki periodically at the set interval in seconds.',
            createEl('br'),
            'Note: Due to a shortcoming in Electron this will produce a lot of errors',
            'in console when pings are failing. These are harmless and safe to ignore, ',
            'but cannot be suppresed.',
        )
        new Setting(this.containerEl)
            .setName('Periodic Ping')
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
    }

    addBlueprints(): void {
        this.containerEl.createEl('h2', { text: 'Blueprint Settings' })

        const blueprintSettings = this.plugin.settings.getBlueprintSettings()

        for (const [id, enabled] of Object.entries(blueprintSettings)) {
            const bp = getBlueprintById(id)
            new Setting(this.containerEl).setName(bp.displayName).addToggle((toggle) => {
                toggle.setValue(enabled).onChange(async (newState) => {
                    this.plugin.settings.blueprints[id] = newState
                    await this.plugin.saveSettings()

                    // Reinitiate services
                    this.plugin.debug('Reloading services')
                    await this.plugin.teardownSerivces()
                    await this.plugin.setupServices()
                })
            })
        }
    }

    addProcessors(): void {
        this.containerEl.createEl('h2', { text: 'Processor Settings' })

        const processorSettings = this.plugin.settings.getMergedProcessors()

        const descHeading = createFragment()
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
                    .onChange(async (newState) => {
                        this.plugin.settings.processors[id] = newState
                        await this.plugin.saveSettings()

                        // Reinitiate services
                        this.plugin.debug('Reloading services')
                        await this.plugin.teardownSerivces()
                        await this.plugin.setupServices()
                    })
            })
        }
    }

    addProcessorConfig(): void {
        this.containerEl.createEl('h2', { text: 'Processor Configuration' })

        new Setting(this.containerEl)
            .setName('ClozePostprocessor: use marks as clozes')
            .setDesc('Translates ==something== into a cloze.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.markToCloze).onChange((newState) => {
                    this.plugin.settings.markToCloze = newState
                    this.plugin.saveSettings()
                })
            })

        new Setting(this.containerEl)
            .setName('ClozePostprocessor: use deletes as clozes')
            .setDesc('Translates ~~something~~ into a cloze.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.deleteToCloze).onChange((newState) => {
                    this.plugin.settings.deleteToCloze = newState
                    this.plugin.saveSettings()
                })
            })
    }

    addDebugging(): void {
        this.containerEl.createEl('h2', { text: 'Debugging Settings' })

        new Setting(this.containerEl)
            .setName('Enabling Debug Logging')
            .setDesc('Useful when developing or reporting errors to the developers.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.debug).onChange((newState) => {
                    this.plugin.settings.debug = newState
                    this.plugin.saveSettings()
                })
            })

        new Setting(this.containerEl)
            .setName('Enabling Networking Debug Logging')
            .setDesc('Useful when developing or reporting errors to the developers.')
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.debugNetwork).onChange((newState) => {
                    this.plugin.settings.debugNetwork = newState
                    this.plugin.saveSettings()
                })
            })
    }
}
