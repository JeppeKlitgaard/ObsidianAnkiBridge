import AnkiBridgePlugin from 'main'
import { App } from 'obsidian'
import { TestingDatabase } from 'test/helpers'
import { SandwichBlueprint } from './sandwich'

const tdb = new TestingDatabase()
let bp: SandwichBlueprint

beforeAll(async () => {
    bp = new SandwichBlueprint({} as App, {} as AnkiBridgePlugin)
    await bp.setup()
})

describe('Sandwich Blueprint', () => {
    it('parses basic file', async () => {
        const target = 'sandwich-pure'

        const rootContent = tdb.getTestFile(target).contents
        const rootFragment = tdb.getTestFileAsFragment(target)
        const rootObject = tdb.getTestObject(target)

        const processResult = await bp.processFragment(rootFragment)

        expect(processResult.renderAsText()).toBe(rootContent)
        expect(processResult).toMatchObject(rootObject)
        expect(processResult.length).toBe(3)
    })
})
