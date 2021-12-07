// jest.mock('obsidian')

import { Fragment } from 'entities/note'
import * as fs from 'fs'
import glob from 'glob'
import { FileStats, TFile, TFolder, Vault } from 'obsidian'
import * as path from 'path'
import { stripCr } from 'utils/file'

export interface TestDataFile {
    contents: string
    filepath: string
}

export class TestingDatabase {
    private testMdFiles: { [name: string]: TestDataFile } = {}
    private testObjects: { [name: string]: any } = {}

    private testDataDir = path.resolve('.', 'src', 'test', 'data')

    constructor() {
        this.loadTestMdFiles()
        this.loadTestObjects()
    }

    private loadTestMdFiles(): void {
        const testDataGlob = path.resolve(this.testDataDir, '*.md')

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

    private loadTestObjects(): void {
        const testDataGlob = path.resolve(this.testDataDir, '*.json')

        const filenames = glob.sync(testDataGlob.replace(/\\/g, '/'))

        filenames.forEach((fn, idx, arr) => {
            const handle = path.basename(arr[idx], '.json')
            const contents = stripCr(fs.readFileSync(fn, 'utf-8'))
            this.testObjects[handle] = JSON.parse(contents)
        })
    }

    getTestObject(id: string): any {
        return this.testObjects[id]
    }

    getTestFile(id: string): TestDataFile {
        return this.testMdFiles[id]
    }

    getTestFileAsFragment(id: string): Fragment {
        const testData = this.getTestFile(id)

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

    const filestats: FileStats = {
        ctime: 1638832881382.5625, // Just some number
        mtime: 1638832881382, // Just some number
        size: 627, // Just some number
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
