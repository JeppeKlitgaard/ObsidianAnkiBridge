// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { App, TAbstractFile, TFile, TFolder } from 'obsidian'
import { TextInputSuggest } from 'suggesters/suggest'
import { getTFilesFromFolder } from 'utils/file'
import { errorWrapperSync } from 'error-utils'
import BetterMathPlugin from 'main'

export class FileSuggest extends TextInputSuggest<TFile> {
    constructor(
        public app: App,
        public inputEl: HTMLInputElement,
        private plugin: BetterMathPlugin,
        private folder: TFolder | undefined = undefined,
        private extensions: Array<string> = ['md'],
    ) {
        super(app, inputEl)

        this.folder = folder || this.app.vault.getRoot()
    }

    getSuggestions(input_str: string): TFile[] {
        const all_files = errorWrapperSync(
            () => getTFilesFromFolder(this.app, this.folder!.path),
            'Folder does not exist!',
        )
        if (!all_files) {
            return []
        }

        const files: TFile[] = []
        const lower_input_str = input_str.toLowerCase()

        all_files.forEach((file: TAbstractFile) => {
            if (
                file instanceof TFile &&
                this.extensions.contains(file.extension) &&
                file.path.toLowerCase().contains(lower_input_str)
            ) {
                files.push(file)
            }
        })

        return files
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path)
    }

    selectSuggestion(file: TFile): void {
        this.inputEl.value = file.path
        this.inputEl.trigger('input')
        this.close()
    }
}
