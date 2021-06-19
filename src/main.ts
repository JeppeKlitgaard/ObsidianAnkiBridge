import { addIcon, Notice, Plugin, TFile } from 'obsidian'
import { ISettings } from 'settings'
import { SettingsTab } from 'gui/settings-tab'
import { CardsService } from 'services/cards'
import { Anki } from 'services/anki'
import { noticeTimeout, flashcardsIcon } from 'consts'

export default class AnkiBridge extends Plugin {
    private settings: ISettings
    private cardsService: CardsService

    async onload() {
        addIcon('flashcards', flashcardsIcon)

        // TODO test when file did not insert flashcards, but one of them is in Anki already
        const anki = new Anki()
        this.settings = (await this.loadData()) || this.getDefaultSettings()
        this.cardsService = new CardsService(this.app, this.settings)

        const statusBar = this.addStatusBarItem()

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
                    anki
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

    private getDefaultSettings(): ISettings {
        return {
            contextAwareMode: true,
            sourceSupport: false,
            codeHighlightSupport: false,
            contextSeparator: ' > ',
            deck: 'Default',
            flashcardsTag: 'card',
        }
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
}
