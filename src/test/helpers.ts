import { Fragment } from 'entities/note'
import * as fs from 'fs'
import glob from 'glob'
import { mocked } from 'jest-mock'
import { FileStats, TFile, TFolder, Vault } from 'obsidian'
import * as path from 'path'
import { stripCr } from 'utils/file'

jest.mock('obsidian')

export interface TestDataFile {
    contents: string
    filepath: string
}

export class TestingDatabase {
    private testMdFiles: { [name: string]: TestDataFile } = {}

    constructor() {
        const testDataDir = path.resolve('.', 'src', 'test', 'data')
        const testDataGlob = path.resolve(testDataDir, '*.md')

        const filenames = glob.sync(testDataGlob.replace(/\\/g, '/'))

        filenames.forEach((fn, idx, arr) => {
            const handle = path.basename(arr[idx], '.md')
            const contents = stripCr(fs.readFileSync(fn, 'utf-8'))
            this.testMdFiles[handle] = {
                contents: contents,
                filepath: fn,
            }
        })
    }

    getData(id: string): TestDataFile {
        return this.testMdFiles[id]
    }

    getDataAsFragment(id: string): Fragment {
        const testData = this.getData(id)

        const frag: Fragment = {
            text: testData.contents,
            sourceFile: filepathToTFile(testData.filepath),
            sourceOffset: 0,
        }

        return frag
    }
}

export function filepathToTFile(filepath: string): TFile {
    const pth = path.parse(filepath)

    const stats = fs.statSync(filepath)

    const filestats: FileStats = {
        ctime: stats.ctimeMs,
        mtime: stats.mtimeMs,
        size: stats.size,
    }

    const tfile: TFile = {
        // TAbstractFile
        vault: new Vault(),
        path: filepath,
        name: pth.name,
        parent: new TFolder(),

        // TFile
        basename: pth.base,
        extension: pth.ext,
        stat: filestats,
    }

    return tfile
}
