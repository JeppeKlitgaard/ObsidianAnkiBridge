import { TestingDatabase } from 'test/helpers'
import { SandwichBlueprint } from './sandwich'

const tdb = new TestingDatabase()
let bp: SandwichBlueprint

beforeAll(async () => {
    bp = new SandwichBlueprint(undefined, undefined)
    await bp.setup()
})

describe('Sandwich Blueprint', () => {
    it('parses basic file', async () => {
        const rootFragment = tdb.getTestFileAsFragment('sandwich-pure')
        const rootObject = tdb.getTestObject('sandwich-pure')

        const processResult = bp.processFragment(rootFragment)

        expect(processResult).toMatchObject(rootObject)
        expect(processResult.length).toBe(3)
    })
})
