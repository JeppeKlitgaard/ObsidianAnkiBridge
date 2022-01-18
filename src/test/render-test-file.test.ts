/**
 * Run using `yarn test` by commenting (1)
 */
import { SandwichBlueprint } from 'blueprints/sandwich'
import { TestingDatabase } from 'test/helpers'
import * as fs from 'fs'
import { App } from 'obsidian'
import AnkiBridgePlugin from 'main'

const tdb = new TestingDatabase()
let bp: SandwichBlueprint

beforeAll(async () => {
    bp = new SandwichBlueprint({} as App, {} as AnkiBridgePlugin)
    await bp.setup()
})

describe('Render test file', () => {
    it('Rendering 1', async () => {
        return // (1)

        const rootFragment = tdb.getTestFileAsFragment('sandwich-pure')
        const processResult = await bp.processFragment(rootFragment)

        const objStr = JSON.stringify(processResult, null, 2)
        fs.writeFileSync('rendered_test_file.json', objStr)
    })
})
