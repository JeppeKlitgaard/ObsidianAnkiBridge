import { getBlueprintById } from 'ankibridge/blueprints'
import { Blueprint } from 'ankibridge/blueprints/base'
import { Fragment, FragmentProcessingResult } from 'ankibridge/entities/note'
import AnkiBridgePlugin from 'ankibridge/main'
import { NoteBase } from 'ankibridge/notes/base'
import { stripCr } from 'ankibridge/utils/file'
import _ from 'lodash'
import { App, TFile } from 'obsidian'

export interface ProcessedFileResult {
    sourceFile: TFile
    elements: FragmentProcessingResult
}

export class Reader {
    protected blueprints: Array<Blueprint>

    constructor(public app: App, public plugin: AnkiBridgePlugin) {
        this.blueprints = []
        const blueprintSettings = this.plugin.settings.getBlueprintSettings()

        for (const [id, enabled] of Object.entries(blueprintSettings)) {
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
                this.plugin.debug('Setting up blueprint: ', bp)
                await bp.setup()
            }),
        )
    }
    async teardown(): Promise<void> {
        await Promise.all(
            this.blueprints.map(async (bp) => {
                this.plugin.debug('Tearing down blueprint: ', bp)
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
