import { addIcon, Notice, Plugin, TFile } from 'obsidian'
import { ISettings, DEFAULT_SETTINGS } from 'settings/settings'
import { SettingsTab } from 'settings/settings-tab'
import { CardsService } from 'services/cards'
import { Anki } from 'services/anki'
import { noticeTimeout, flashcardsIcon, pluginName } from 'consts'
import { Reader } from 'services/reader'
import { Bridge } from 'services/bridge'

export default class AnkiBridgePlugin extends Plugin {
    public settings: ISettings

    public anki: Anki
    public cardsService: CardsService
    private reader: Reader
    private bridge: Bridge

    private statusbar: HTMLElement

    async onload() {
        addIcon('flashcards', flashcardsIcon)

        await this.loadSettings()

        this.anki = new Anki(this.app, this)
        this.reader = new Reader(this.app, this)
        this.bridge = new Bridge(this.app, this)

        await this.reader.setup()

        this.statusbar = this.addStatusBarItem()

        this.addCommand({
            id: 'anki-bridge-sync-open-file',
            name: 'Sync file with Anki',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile()
                if (activeFile) {
                    await this.syncFile(activeFile)
                    new Notice("Synced with Anki ✔")
                } else {
                    new Notice("Please open a file first")
                }
            },
        })

        this.addCommand({
            id: 'anki-bridge-sync-all-files',
            name: 'Sync all files with Anki',
            callback: async () => {
                new Notice("Syncing all files with Anki...")
                await Promise.all(this.app.vault.getMarkdownFiles().map(async (file) => {
                    await this.syncFile(file)
                }))

                new Notice ("Synced all files with Anki ✔")
            },
        })

        this.addRibbonIcon('flashcards', 'Sync with Anki', async () => {
            const activeFile = this.app.workspace.getActiveFile()
            if (activeFile) {
                await this.syncFile(activeFile)
                new Notice("Synced with Anki ✔")
            } else {
                new Notice('Please open a file first')
            }
        })

        this.addSettingTab(new SettingsTab(this.app, this))

        this.registerInterval(
            window.setInterval(
                () =>
                    this.anki
                        .ping()
                        .then(() => this.statusbar.setText('Anki ✔'))
                        .catch(() => this.statusbar.setText('Anki ❌')),
                this.settings.pollInterval,
            ),
        )
    }

    async onunload() {
        await this.saveData(this.settings)
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }

    public debug(text: string): void {
        if (this.settings.debug) {
            console.log(this.manifest.name + ': ' + text)
        }
    }

    public error(text: string): void {
        console.error(this.manifest.name + ': ' + text)
    }

    private async syncFile(file: TFile): Promise<void> {
        const elements = await this.reader.readFile(file)
        await this.bridge.processFileResults(elements)
    }
}
