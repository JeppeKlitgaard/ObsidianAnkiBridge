import { getBlueprintById } from 'blueprints'
import { Blueprint } from 'blueprints/base'
import { FragmentProcessingResult } from 'entities/note'
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

    async readFile(file: TFile): Promise<ProcessedFileResult> {
        const fileContent = stripCr(await this.app.vault.read(file))

        let elements: FragmentProcessingResult = [
            {
                text: fileContent,
                sourceFile: file,
                sourceOffset: 0,
            },
        ]

        for (const blueprint of this.blueprints) {
            const elementsToProcess = [...elements] // Clone
            elements = []

            while (elementsToProcess.length) {
                const element = elementsToProcess.pop()
                if (element instanceof NoteBase) {
                    elements.push(element)
                    continue
                }

                elements.push(...blueprint.processFragment(element))
            }
        }

        return { sourceFile: file, elements: elements }
    }
}
