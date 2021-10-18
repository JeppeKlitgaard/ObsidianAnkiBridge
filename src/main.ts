import { addIcon, Notice, Plugin, TFile } from 'obsidian'
import { ISettings, DEFAULT_SETTINGS } from 'settings/settings'
import { SettingsTab } from 'settings/settings-tab'
import { CardsService } from 'services/cards'
import { BridgeService } from 'service'
import { Anki } from 'services/anki'
import { noticeTimeout, flashcardsIcon, pluginName } from 'consts'
import { SandwichBlueprint } from 'blueprints/sandwich'
import { stripCr } from 'utils'
import { Reader } from 'services/reader'
import { Bridge } from 'services/bridge'

export default class AnkiBridgePlugin extends Plugin {
    public settings: ISettings

    public anki: Anki
    public cardsService: CardsService
    private reader: Reader
    private bridge: Bridge

    async onload() {
        addIcon('flashcards', flashcardsIcon)

        await this.loadSettings()

        // TODO test when file did not insert flashcards, but one of them is in Anki already
        this.anki = new Anki(this.app, this)
        this.reader = new Reader(this.app, this)
        this.bridge = new Bridge(this.app, this)

        await this.reader.setup()

        const statusBar = this.addStatusBarItem()

        this.addCommand({
            id: 'test-command',
            name: 'Test Command',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile()
                const elements = await this.reader.readFile(activeFile)
                await this.bridge.processFileResults(elements)
                console.log(elements)
                const blueprint = new SandwichBlueprint(this.app, this)
                await blueprint.setup()
                const text = stripCr(await this.app.vault.read(activeFile))
                // let cards = await blueprint.processText(text)
                // console.log(cards)
            },
        })

        this.addCommand({
            id: 'generate-flashcard-current-file',
            name: 'Generate for the current file',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile()
                if (activeFile) {
                    if (!checking) {
                        this.generateCards(activeFile)
                    }
                    return true
                }
                return false
            },
        })

        this.addCommand({
            id: 'anki-bridge-process-current-file',
            name: 'Process Current File',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile()
                if (activeFile) {
                    if (!checking) {
                        this.processFile(activeFile)
                    }
                    return true
                }
                return false
            },
        })

        this.addRibbonIcon('flashcards', 'Generate flashcards', () => {
            const activeFile = this.app.workspace.getActiveFile()
            if (activeFile) {
                this.generateCards(activeFile)
            } else {
                new Notice('Open a file before')
            }
        })

        this.addSettingTab(new SettingsTab(this.app, this))

        this.registerInterval(
            window.setInterval(
                () =>
                    this.anki
                        .ping()
                        .then(() => statusBar.setText('Anki ⚡️'))
                        .catch(() => statusBar.setText('')),
                15 * 1000,
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
            console.log(pluginName + ': ' + text)
        }
    }

    public error(text: string): void {
        console.error(pluginName + ': ' + text)
    }

    private generateCards(activeFile: TFile) {
        this.cardsService
            .execute(activeFile)
            .then((res) => {
                new Notice(res.join(' '), noticeTimeout)
            })
            .catch((err) => {
                Error(err)
            })
    }

    // public processFile(file: TFile) {
    //     this.bridgeService
    //         .processFile(file)
    //         .then((res) => {
    //             new Notice('Hello')
    //         })
    //         .catch((err) => {
    //             Error(err)
    //         })
    // }
}
