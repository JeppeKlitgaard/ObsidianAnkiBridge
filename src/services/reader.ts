import { getBlueprintById } from 'blueprints'
import { Blueprint } from 'blueprints/base'
import { Fragment, FragmentProcessingResult } from 'entities/note'
import _ from 'lodash'
import AnkiBridgePlugin from 'main'
import { NoteBase } from 'notes/base'
import { App, TFile } from 'obsidian'
import { stripCr } from 'utils'

export interface ProcessedFileResult {
    sourceFile: TFile
    elements: FragmentProcessingResult
}

export class Reader {
    protected blueprints: Array<Blueprint>

    constructor(public app: App, public plugin: AnkiBridgePlugin) {
        this.blueprints = []

        for (const [id, enabled] of Object.entries(this.plugin.settings.blueprints)) {
            if (enabled) {
                const blueprintClass = getBlueprintById(id)
                const blueprint = new blueprintClass(this.app, this.plugin)

                this.blueprints.push(blueprint)
            }
        }
    }

    async setup(): Promise<void> {
        await Promise.all(
            this.blueprints.map(async (bp) => {
                await bp.setup()
            }),
        )
    }
    async teardown(): Promise<void> {
        await Promise.all(
            this.blueprints.map(async (bp) => {
                await bp.teardown()
            }),
        )
    }

    async readFile(file: TFile): Promise<ProcessedFileResult> {
        const fileContent = stripCr(await this.app.vault.read(file))

        const initialFragment: Fragment = {
            text: fileContent,
            sourceFile: file,
            sourceOffset: 0,
        }

        const notes: Array<NoteBase> = []
        let fragments: Array<Fragment> = [initialFragment]

        for (const blueprint of this.blueprints) {
            const fragmentsToTry = [...fragments]
            fragments = []

            while (fragmentsToTry.length) {
                const element = fragmentsToTry.pop()!
                const processedElements = await blueprint.processFragment(element)

                for (const processedElement of processedElements) {
                    if (processedElement instanceof NoteBase) {
                        notes.push(processedElement)
                        continue
                    }

                    fragments.push(processedElement)
                }
            }
        }

        const processedElements = [...notes, ...fragments]
        const sortedProcessedElements = _.sortBy(processedElements, [
            (o) => {
                if (o instanceof NoteBase) {
                    return o.source.from
                }

                return o.sourceOffset
            },
        ])

        const processingResult = new FragmentProcessingResult(...sortedProcessedElements)

        return { sourceFile: file, elements: processingResult }
    }
}
