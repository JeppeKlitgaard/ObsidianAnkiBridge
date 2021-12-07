import { SandwichBlueprint } from 'blueprints/sandwich'
import { TestingDatabase } from 'test/helpers'
import * as fs from 'fs'

const tdb = new TestingDatabase()
let bp: SandwichBlueprint

beforeAll(async () => {
    bp = new SandwichBlueprint(undefined, undefined)
    await bp.setup()
})

describe('Render test file', () => {
    it('Rendering 1', async () => {
        return

        const rootFragment = tdb.getTestFileAsFragment('sandwich-pure')
        const processResult = bp.processFragment(rootFragment)

        const objStr = JSON.stringify(processResult, null, 2)
        fs.writeFileSync('rendered_test_file.json', objStr)
    })
})
