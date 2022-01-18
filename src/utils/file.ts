import { DefaultDeckMap } from 'entities/other'
import { AnkiBridgeError } from 'error'
import {
    App,
    normalizePath,
    TFolder,
    TFile,
    TAbstractFile,
    Vault,
    DataAdapter,
    FileSystemAdapter,
} from 'obsidian'

export function resolveTFolder(app: App, folderStr: string): TFolder {
    folderStr = normalizePath(folderStr)

    const folder = app.vault.getAbstractFileByPath(folderStr)
    if (!folder) {
        throw new AnkiBridgeError(`Folder "${folderStr}" doesn't exist`)
    }
    if (!(folder instanceof TFolder)) {
        throw new AnkiBridgeError(`${folderStr} is a file, not a folder`)
    }

    return folder
}

export function resolveTFile(app: App, fileStr: string): TFile {
    fileStr = normalizePath(fileStr)

    const file = app.vault.getAbstractFileByPath(fileStr)
    if (!file) {
        throw new AnkiBridgeError(`File "${fileStr}" doesn't exist`)
    }
    if (!(file instanceof TFile)) {
        throw new AnkiBridgeError(`${fileStr} is a folder, not a file`)
    }

    return file
}

export function getTFilesFromFolder(app: App, folderStr: string): Array<TFile> {
    const folder = resolveTFolder(app, folderStr)

    const files: Array<TFile> = []
    Vault.recurseChildren(folder, (file: TAbstractFile) => {
        if (file instanceof TFile) {
            files.push(file)
        }
    })

    files.sort((a, b) => {
        return a.basename.localeCompare(b.basename)
    })

    return files
}

export function getDefaultDeckForFolder(
    folder: TFolder,
    maps: Array<DefaultDeckMap>,
): string | undefined {
    do {
        const match = maps.find((e) => e.folder == folder.path)

        if (match && match.deck) {
            return match.deck
        }

        folder = folder.parent
    } while (folder)
}

/**
 * Replaces \r with nothing.
 * @param {string} text - Text to strip
 * @return {string} Stripped text
 */
export function stripCr(text: string): string {
    return text.replace(/\r/g, '')
}

export function getFullPath(adapter: DataAdapter, normalisedPath: string): string {
    if (!(adapter instanceof FileSystemAdapter)) {
        throw TypeError('Wrong data adapter on vault. Contact developer on GitHub')
    }

    return adapter.getFullPath(normalisedPath)
}
