import { addIcon, Notice, Plugin, TFile } from 'obsidian'
import { ISettings, DEFAULT_SETTINGS } from 'settings/settings'
import { SettingsTab } from 'settings/settings-tab'
import { CardsService } from 'services/cards'
import { Anki } from 'services/anki'
import { flashcardsIcon } from 'consts'
import { Reader } from 'services/reader'
import { Bridge } from 'services/bridge'
import { SyncResult } from 'entities/other'

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

        await this.initiateServices()

        this.statusbar = this.addStatusBarItem()

        this.addCommand({
            id: 'anki-bridge-ping',
            name: 'Ping Anki',
            callback: async () => {
                if (await this.pingAnki()) {
                    new Notice('Connection succesful ✔')
                } else {
                    new Notice('Connection failed ❌')
                }
            },
        })

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

    async initiateServices(): Promise<void> {
        this.anki = new Anki(this.app, this)
        this.reader = new Reader(this.app, this)
        this.bridge = new Bridge(this.app, this)

        await this.reader.setup()
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
    private async syncFileRoutine(file: TFile): Promise<number> {
        const elements = await this.reader.readFile(file)
        const numberOfErrors = await this.bridge.processFileResults(elements)
        return numberOfErrors
    }

    private handleSyncResult(result: SyncResult): void {
        if (result.fatalError) {
            if (result.fatalErrorString === 'failed to issue request') {
                this.setConnectionStatus(false)
                this.printFailedConnection()
            } else {
                new Notice(
                    '⚠ Unexpected error occured. Please inform maintainer on GitHub and include console output!',
                )
                throw result.fatalErrorString
            }
        } else if (result.numberOfNonFatalErrors === 0) {
            new Notice('✔ Synced with Anki')
        } else {
            const errNumStr =
                result.numberOfNonFatalErrors > 0
                    ? String(result.numberOfNonFatalErrors)
                    : 'an unknown amount of'
            new Notice(`🟡 Synced with Anki but with ${errNumStr} error(s).`)
        }
    }

    private async syncFile(file: TFile): Promise<SyncResult> {
        let hasErrored: boolean
        let numberOfNonFatalErrors = -1
        let fatalErrorString: string

        try {
            numberOfNonFatalErrors = await this.syncFileRoutine(file)
            hasErrored = false
        } catch (e) {
            hasErrored = true
            fatalErrorString = e
        }

        const result: SyncResult = {
            fatalError: hasErrored,
            fatalErrorString: fatalErrorString,
            numberOfNonFatalErrors: numberOfNonFatalErrors,
        }

        return result
    }

    private async syncActiveFile(): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile()
        if (activeFile) {
            if (!(await this.pingAnki())) {
                this.printFailedConnection()
                return
            }
            const result = await this.syncFile(activeFile)
            this.handleSyncResult(result)
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
        let numberOfNonFatalErrors = 0
        let fatalErrorString: string

        try {
            await Promise.all(
                this.app.vault.getMarkdownFiles().map(async (file) => {
                    numberOfNonFatalErrors += await this.syncFileRoutine(file)
                }),
            )

            hasErrored = false
        } catch (e) {
            hasErrored = true
            fatalErrorString = e
        }

        const result: SyncResult = {
            fatalError: hasErrored,
            fatalErrorString: fatalErrorString,
            numberOfNonFatalErrors: numberOfNonFatalErrors,
        }

        this.handleSyncResult(result)
    }
}
