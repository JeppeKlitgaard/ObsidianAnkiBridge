import { NoteBase } from 'notes/base'
import { getLinkpath, TFile } from 'obsidian'
import { ProcessorContext } from 'processors/base'
import { Postprocessor } from './base'
import { fileTypeFromBuffer } from 'file-type'
import { fileTypeToMediaType } from 'utils/encoding'
import { Media } from 'entities/note'
import { getFullPath } from 'utils/file'

export class MediaPostprocessor extends Postprocessor {
    static id = 'MediaPostprocessor'
    static displayName = 'MediaPostprocessor'
    static weight = 70
    static defaultConfigState = true

    public async postprocess(
        note: NoteBase,
        domField: HTMLTemplateElement,
        ctx: ProcessorContext,
    ): Promise<void> {
        const embeds = Array.from(domField.content.querySelectorAll('span.internal-embed'))

        await Promise.all(
            embeds.map(async (embed) => {
                const srcpath = embed.getAttribute('src')
                const linkpath = getLinkpath(srcpath) // This might be dodgy?

                const file = this.app.metadataCache.getFirstLinkpathDest(linkpath, srcpath)

                if (!(file instanceof TFile)) {
                    console.warn('Offending linkpath: ', linkpath)
                    console.warn('Offending file: ', file)
                    throw TypeError('Embed was not a file. Contact developer on GitHub.')
                }

                const data = await this.app.vault.readBinary(file)

                const fileType = await fileTypeFromBuffer(data)

                const mediaType = fileTypeToMediaType(fileType)
                const path = getFullPath(this.app.vault.adapter, file.path)
                const media = new Media(srcpath, path, mediaType, data, [ctx.fieldName])

                note.medias.push(media)

                const imgEl = createEl('img')
                imgEl.src = media.filename

                embed.parentNode.replaceChild(imgEl, embed)
            }),
        )
    }
}
