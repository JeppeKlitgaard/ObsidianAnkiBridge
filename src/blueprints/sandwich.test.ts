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
        const fragment = tdb.getDataAsFragment('sandwich-pure')

        const processResult = bp.processFragment(fragment)
    })
})
