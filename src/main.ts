import { addIcon, Notice, Plugin, TFile } from 'obsidian'
import { DEFAULT_SETTINGS, Settings } from 'settings/settings'
import { SettingsTab } from 'settings/settings-tab'
import { Anki } from 'services/anki'
import flashcardsIcon from 'assets/flashcard.svg_content'
import { Reader } from 'services/reader'
import { Bridge } from 'services/bridge'
import { SyncResult } from 'entities/other'
import { NoteAction } from 'entities/note'
import _ from 'lodash'

export default class AnkiBridgePlugin extends Plugin {
    public settings: Settings

    public anki: Anki
    private reader: Reader
    private bridge: Bridge

    private statusbar: HTMLElement
    public connectionStatus = false

    private periodicPingIntervalId: number

    async onload() {
        console.log('Loading ' + this.manifest.name)

        addIcon('flashcards', flashcardsIcon)

        await this.loadSettings()
        await this.setupServices()

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
            id: 'anki-bridge-sync-active-file',
            name: 'Sync active file with Anki',
            callback: async () => {
                await this.syncActiveFile()
            },
        })
        this.addCommand({
            id: 'anki-bridge-silent-sync-active-file',
            name: 'Sync active file with Anki (Silent)',
            callback: async () => {
                await this.syncActiveFile(false, false)
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

        this.setupPeriodicPing()

        this.addSettingTab(new SettingsTab(this.app, this))

        await this.pingAnki()
    }

    async onunload() {
        console.log('Unloading ' + this.manifest.name)

        this.teardownPeriodicPing()
        await this.teardownSerivces()

        await this.saveData(this.settings)
    }

    async setupServices(): Promise<void> {
        this.anki = new Anki(this.app, this)
        this.reader = new Reader(this.app, this)
        this.bridge = new Bridge(this.app, this)

        await this.reader.setup()
    }

    async teardownSerivces(): Promise<void> {
        await this.reader.teardown()
    }

    async loadSettings() {
        this.settings = Object.assign(new Settings(), DEFAULT_SETTINGS, await this.loadData())
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

    public setupPeriodicPing(): void {
        this.teardownPeriodicPing()

        if (this.settings.periodicPingEnabled) {
            this.periodicPingIntervalId = window.setInterval(
                async () => await this.pingAnki(),
                this.settings.periodicPingInterval * 1000,
            )

            this.registerInterval(this.periodicPingIntervalId)
        }
    }

    private teardownPeriodicPing(): void {
        if (this.periodicPingIntervalId !== undefined) {
            window.clearInterval(this.periodicPingIntervalId)
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
    private async syncFileRoutine(file: TFile): Promise<Array<NoteAction>> {
        const elements = await this.reader.readFile(file)
        const result = await this.bridge.processFileResults(elements)

        return result
    }

    private handleSyncResult(
        result: SyncResult,
        displayOnSuccess = true,
        displayOnFailure = true,
    ): void {
        if (result.fatalError) {
            if (result.fatalErrorString === 'failed to issue request') {
                this.setConnectionStatus(false)
                if (displayOnFailure) {
                    this.printFailedConnection()
                }
                return
            } else {
                if (displayOnFailure) {
                    new Notice(
                        '⚠ Unexpected error occured. Please inform maintainer on GitHub and include console output!' +
                            '\n\n' +
                            'Error: ' +
                            result.fatalErrorString,
                    )
                }

                throw result.fatalErrorString
            }
        }

        const wasSuccess = !result.noteActions.includes(NoteAction.NonFatalError)
        const statusSymbol = wasSuccess ? '✔' : '🟡'

        if (displayOnSuccess || (displayOnFailure && !wasSuccess)) {
            // Instantiate counts with default values of 0.
            // Working with enum is tricky, so this is ugly
            let counts = _.zipObject(
                Object.keys(NoteAction)
                    .filter((x) => !isNaN(parseInt(x)))
                    .map((x) => parseInt(x)),
                _.times(Object.keys(NoteAction).length / 2, _.constant(0)),
            ) as Record<NoteAction, number>

            counts = _.merge(counts, _.countBy(result.noteActions))

            if (counts[NoteAction.NonFatalError] === 0) {
                let msg = `${statusSymbol} Synced with Anki\n\n`

                if (result.totalFiles !== undefined) {
                    msg += `Files processed: ${result.totalFiles}\n`
                }
                msg += `Notes processed: ${result.noteActions.length}\n\n`

                for (const [action, count] of Object.entries(counts)) {
                    const actionStr =
                        parseInt(action) === NoteAction.NonFatalError
                            ? 'Errored'
                            : NoteAction[action]
                    msg += `Notes ${actionStr.toLowerCase()}: ${count}.\n`
                }

                new Notice(msg)
            }
        }
    }

    private async syncFile(file: TFile): Promise<SyncResult> {
        const result: Partial<SyncResult> = {}

        try {
            result.noteActions = await this.syncFileRoutine(file)
            result.fatalError = false
        } catch (e) {
            result.noteActions = []
            result.fatalError = true
            result.fatalErrorString = e
        }

        return result as SyncResult
    }

    private async syncActiveFile(displayOnSuccess = true, displayOnFailure = true): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile()
        if (activeFile) {
            if (!this.shouldIgnoreFile(activeFile)) {
                if (!(await this.pingAnki())) {
                    if (displayOnFailure) {
                        this.printFailedConnection()
                    }
                    return
                }
                const result = await this.syncFile(activeFile)
                this.handleSyncResult(result, displayOnSuccess, displayOnFailure)
            } else {
                this.debug('File configured to be ignored.')
                if (displayOnFailure) new Notice('❌ This file is configured to be ignored')
            }
        } else {
            this.debug('No file opened')
            if (displayOnFailure) new Notice('Please open a file first')
        }
    }

    private async syncAllFiles(): Promise<void> {
        const INITIAL_LINE = 'Syncing all files with Anki...'
        let syncCounter = 0

        const notice = new Notice(INITIAL_LINE, 0)

        const files = this.app.vault.getMarkdownFiles()
        notice.setMessage(INITIAL_LINE + '\n\n' + `${syncCounter}/${files.length}`)

        if (!(await this.pingAnki())) {
            this.printFailedConnection()
            return
        }

        const result: Partial<SyncResult> = {
            noteActions: [],
            totalFiles: files.length,
        }

        try {
            await Promise.all(
                this.app.vault.getMarkdownFiles().map(async (file) => {
                    if (!this.shouldIgnoreFile(file)) {
                        result.noteActions!.push(...(await this.syncFileRoutine(file)))
                    }
                    syncCounter++
                    notice.setMessage(INITIAL_LINE + '\n\n' + `${syncCounter}/${files.length}`)
                }),
            )

            result.fatalError = false
        } catch (e) {
            result.fatalError = true
            result.fatalErrorString = e
        }

        notice.hide()
        this.handleSyncResult(result as SyncResult)
    }
}
