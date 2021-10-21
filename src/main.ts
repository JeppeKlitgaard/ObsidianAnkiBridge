import { addIcon, Notice, Plugin, TFile } from 'obsidian'
import { ISettings, DEFAULT_SETTINGS } from 'settings/settings'
import { SettingsTab } from 'settings/settings-tab'
import { CardsService } from 'services/cards'
import { Anki } from 'services/anki'
import { flashcardsIcon } from 'consts'
import { Reader } from 'services/reader'
import { Bridge } from 'services/bridge'

export default class AnkiBridgePlugin extends Plugin {
    public settings: ISettings

    public anki: Anki
    public cardsService: CardsService
    private reader: Reader
    private bridge: Bridge

    private statusbar: HTMLElement
    public connectionStatus = false

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
                await this.syncActiveFile()
            },
        })

        this.addCommand({
            id: 'anki-bridge-sync-all-files',
            name: 'Sync all files with Anki',
            callback: async () => {
                await this.syncAllFiles()
            },
        })

        this.addRibbonIcon('flashcards', 'Sync with Anki', async () => {
            await this.syncActiveFile()
        })

        this.addSettingTab(new SettingsTab(this.app, this))

        await this.pingAnki()
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

    public async pingAnki(): Promise<boolean> {
        let hasErrored: boolean
        try {
            await this.anki.ping()
            hasErrored = false
        } catch (e) {
            hasErrored = true
        }

        this.setConnectionStatus(!hasErrored)
        return !hasErrored
    }

    private setConnectionStatus(status: boolean): void {
        this.connectionStatus = status

        const statusbarText = 'Anki ' + (status ? '✔' : '❌')
        this.statusbar.setText(statusbarText)
    }

    public getConnectionStatus(): boolean {
        return this.connectionStatus
    }

    private printFailedConnection(): void {
        const errMsg = 'Failed to connect to Anki ❌\n\nIs it running?'
        new Notice(errMsg)
    }

    /**
     * Can raise an error
     */
    private async syncFileRoutine(file: TFile): Promise<void> {
        const elements = await this.reader.readFile(file)
        await this.bridge.processFileResults(elements)
    }

    private handleSyncFileError(error: string): void {
        if (error == 'failed to issue request') {
            this.setConnectionStatus(false)
            this.printFailedConnection()
        } else {
            throw error
        }
    }

    private async syncFile(file: TFile): Promise<boolean> {
        let hasErrored: boolean
        try {
            await this.syncFileRoutine(file)
            hasErrored = false
        } catch (e) {
            hasErrored = true
            this.handleSyncFileError(e)
        }

        return !hasErrored
    }

    private async syncActiveFile(): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile()
        if (activeFile) {
            if (!(await this.pingAnki())) {
                this.printFailedConnection()
                return
            }
            if (await this.syncFile(activeFile)) {
                new Notice('Synced with Anki ✔')
            }
        } else {
            new Notice('Please open a file first')
        }
    }

    private async syncAllFiles(): Promise<void> {
        new Notice('Syncing all files with Anki...')

        if (!(await this.pingAnki())) {
            this.printFailedConnection()
            return
        }

        let hasErrored: boolean
        try {
            await Promise.all(
                this.app.vault.getMarkdownFiles().map(async (file) => {
                    await this.syncFileRoutine(file)
                }),
            )

            hasErrored = false
        } catch (e) {
            hasErrored = true
            this.handleSyncFileError(e)
        } finally {
            if (!hasErrored) {
                new Notice('Synced all files with Anki ✔')
            }
        }
    }
}
