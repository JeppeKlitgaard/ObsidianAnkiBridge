import { Media } from 'ankibridge/entities/note'
import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Postprocessor } from 'ankibridge/processors/postprocessors/base'
import { fileTypeFromBuffer, FileTypeResult } from 'file-type'
import { getLinkpath, Notice, TFile } from 'obsidian'

import { fileTypeToMediaType } from '../../utils/encoding'
import { getFullPath } from '../../utils/file'
import { isVideo } from '../../utils/media'

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
        const embeds = Array.from(domField.content.querySelectorAll('div.internal-embed'))

        await Promise.all(
            embeds.map(async (embed) => {
                const alt = embed.innerHTML;
                const srcpath = embed.getAttribute("src");
                if (srcpath == null) {
                    throw new Error(`Could not find src attribute for embed: ${alt} for file: ${note.source.file.path}`);
                }
                const file = this.app.metadataCache.getFirstLinkpathDest(srcpath, note.source.file.path);
                if (file === null) {
                    throw new Error(`Could not find embed: ${srcpath} for file: ${note.source.file.path}: media postprocessor could not find source file - is it an embedded media file?`);
                }

                const resourcepath = this.app.vault.adapter.getResourcePath(file.path)

                if (!(file instanceof TFile)) {
                    console.warn('Offending linkpath: ', note.source.file.path)
                    console.warn('Offending file: ', file)
                    throw TypeError('Embed was not a file. Contact developer on GitHub.')
                }

                const path = getFullPath(this.app.vault.adapter, file.path)
                const data = await this.app.vault.readBinary(file)

                const fileType = ((await fileTypeFromBuffer(data)) || {
                    mime: 'application/octet-stream',
                    ext: '',
                }) as FileTypeResult

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

                embed.replaceWith(mediaEl)
            }),
        )
    }
}
