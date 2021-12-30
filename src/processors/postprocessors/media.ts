import { NoteBase } from 'notes/base'
import { getLinkpath, TFile } from 'obsidian'
import { ProcessorContext } from 'processors/base'
import { Postprocessor } from './base'
import { fileTypeFromBuffer } from 'file-type'
import { fileTypeToMediaType } from 'utils/encoding'
import { Media } from 'entities/note'
import { getFullPath } from 'utils/file'
import { isVideo } from 'utils/media'

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
                const alt = embed.innerHTML

                const srcpath = embed.getAttribute('src')
                const linkpath = getLinkpath(srcpath) // This might be dodgy?

                const file = this.app.metadataCache.getFirstLinkpathDest(linkpath, srcpath)
                const resourcepath = this.app.vault.adapter.getResourcePath(file.path)

                if (!(file instanceof TFile)) {
                    console.warn('Offending linkpath: ', linkpath)
                    console.warn('Offending file: ', file)
                    throw TypeError('Embed was not a file. Contact developer on GitHub.')
                }

                const path = getFullPath(this.app.vault.adapter, file.path)
                const data = await this.app.vault.readBinary(file)

                const fileType = await fileTypeFromBuffer(data)
                let mediaType = fileTypeToMediaType(fileType)

                if (mediaType === 'video') {
                    const videoCheck = await isVideo(resourcepath)
                    mediaType = videoCheck ? 'video' : 'audio'
                }

                const media = new Media(srcpath, path, mediaType, data, [ctx.noteField])
                note.medias.push(media)

                let mediaEl: HTMLVideoElement | HTMLAudioElement | HTMLImageElement
                switch (mediaType) {
                    case 'image': {
                        mediaEl = createEl('img')
                        mediaEl.src = media.filename
                        break
                    }

                    case 'audio': {
                        mediaEl = createEl('audio')
                        break
                    }

                    case 'video': {
                        mediaEl = createEl('video')
                        break
                    }
                }

                if (mediaType === 'audio' || mediaType == 'video') {
                    mediaEl = mediaEl as HTMLVideoElement | HTMLAudioElement
                    mediaEl.controls = true

                    const sourceEl = createEl('source')
                    sourceEl.src = media.filename
                    sourceEl.type = fileType.mime

                    mediaEl.appendChild(sourceEl)
                }

                mediaEl.setAttribute('alt', alt)

                embed.parentNode.replaceChild(mediaEl, embed)
            }),
        )
    }
}
