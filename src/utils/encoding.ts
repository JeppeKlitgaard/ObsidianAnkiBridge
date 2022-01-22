// https://stackoverflow.com/a/58339391/5036246

import { MediaType } from 'ankibridge/entities/note'
import { FileTypeResult } from 'file-type'

// https://stackoverflow.com/questions/34495796/javascript-promises-with-filereader
export function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([buffer])

        const reader = new FileReader()

        reader.onload = (event) => {
            resolve(event.target!.result as string)
        }
        reader.onerror = reject

        // See: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
        reader.readAsDataURL(blob)
    })
}

export function fileTypeToMediaType(fileType: FileTypeResult): MediaType {
    const mime = fileType.mime

    if (mime.startsWith('image')) {
        return 'image'
    } else if (mime.startsWith('video')) {
        return 'video'
    } else if (mime.startsWith('audio')) {
        return 'audio'
    } else {
        throw TypeError('Could not determine mediatype from filetype: ' + JSON.stringify(mime))
    }
}
