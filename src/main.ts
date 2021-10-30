import { addIcon, Notice, Plugin, TFile } from 'obsidian'
import { ISettings, DEFAULT_SETTINGS } from 'settings/settings'
import { SettingsTab } from 'settings/settings-tab'
import { Anki } from 'services/anki'
import flashcardsIcon from 'assets/flashcard.svg_content'
import { Reader } from 'services/reader'
import { Bridge } from 'services/bridge'
import { FileProcessingResult, SyncResult } from 'entities/other'

export default class AnkiBridgePlugin extends Plugin {
    public settings: ISettings

    public anki: Anki
    private reader: Reader
    private bridge: Bridge

    private statusbar: HTMLElement
    public connectionStatus = false

    async onload() {
        console.log("Loading " + this.manifest.name)

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

        this.setupSaveWatcher()

        this.setupPeriodicPing()

        this.addSettingTab(new SettingsTab(this.app, this))

        await this.pingAnki()
    }

    async onunload() {
        console.log("Unloading " + this.manifest.name)

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

    private setupSaveWatcher() {
        // Source for save setting
        // https://github.com/hipstersmoothie/obsidian-plugin-prettier/blob/main/src/main.ts
        const saveCommandDefinition = (this.app as any).commands?.commands?.['editor:save-file']
        const save = saveCommandDefinition?.callback

        if (typeof save === 'function') {
            saveCommandDefinition.callback = async () => {
                if (this.settings.syncOnSave) {
                    const file = this.app.workspace.getActiveFile()

                    if (this.getConnectionStatus() && file && !this.shouldIgnoreFile(file)) {
                        await this.syncActiveFile(this.settings.displaySyncOnSave)
                    }
                }
            }
        }
    }

    private setupPeriodicPing() {
        if (this.settings.periodicPingEnabled) {
            this.registerInterval(
                window.setInterval(
                    async () => await this.pingAnki(),
                    this.settings.periodicPingInterval * 1000,
                ),
            )
        }
    }

    private shouldIgnoreFile(file: TFile): boolean {
        let folder = file.parent

        do {
            const match = this.settings.foldersToIgnore.find((e) => e == folder.path)

            if (match) {
                return true
            }

            folder = folder.parent
        } while (folder)

        return false
    }

    /**
     * Can raise an error
     */
    private async syncFileRoutine(file: TFile): Promise<FileProcessingResult> {
        const elements = await this.reader.readFile(file)
        const result = await this.bridge.processFileResults(elements)

        return result
    }

    private handleSyncResult(result: SyncResult, displayOnSuccess = true): void {
        if (result.fatalError) {
            if (result.fatalErrorString === 'failed to issue request') {
                this.setConnectionStatus(false)
                this.printFailedConnection()
            } else {
                new Notice(
                    '⚠ Unexpected error occured. Please inform maintainer on GitHub and include console output!' +
                        '\n\n' +
                        'Error: ' +
                        result.fatalErrorString,
                )
                throw result.fatalErrorString
            }
        } else if (result.nonFatalErrors === 0) {
            if (displayOnSuccess && result.notesProcessed) {
                new Notice(
                    '✔ Synced with Anki\n' +
                        '\n' +
                        `Notes processed: ${result.notesProcessed}\n` +
                        `Notes synced: ${result.notesSynced}`,
                )
            }
        } else {
            new Notice(
                '🟡 Synced with Anki\n' +
                    '\n' +
                    `Notes failed: ${result.nonFatalErrors}\n` +
                    `Notes processed: ${result.notesProcessed}\n` +
                    `Notes synced: ${result.notesSynced}`,
            )
        }
    }

    private async syncFile(file: TFile): Promise<SyncResult> {
        const result: Partial<SyncResult> = {}

        try {
            Object.assign(result, await this.syncFileRoutine(file))
            result.fatalError = false
        } catch (e) {
            result.fatalError = true
            result.fatalErrorString = e
        }

        return result as SyncResult
    }

    private async syncActiveFile(displayOnSuccess = true): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile()
        if (activeFile) {
            if (!this.shouldIgnoreFile(activeFile)) {
                if (!(await this.pingAnki())) {
                    this.printFailedConnection()
                    return
                }
                const result = await this.syncFile(activeFile)
                this.handleSyncResult(result, displayOnSuccess)
            } else {
                new Notice('❌ This file is configured to be ignored')
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

        const result: Partial<SyncResult> = {
            nonFatalErrors: 0,
            notesProcessed: 0,
            notesSynced: 0
        }

        try {
            await Promise.all(
                this.app.vault.getMarkdownFiles().map(async (file) => {
                    if (!this.shouldIgnoreFile(file)) {
                        const fileResult = await this.syncFileRoutine(file)

                        result.nonFatalErrors += fileResult.nonFatalErrors
                        result.notesProcessed += fileResult.notesProcessed
                        result.notesSynced += fileResult.notesSynced
                    }
                }),
            )

            result.fatalError = false
        } catch (e) {
            result.fatalError = true
            result.fatalErrorString = e
        }

        this.handleSyncResult(result as SyncResult)
    }
}
