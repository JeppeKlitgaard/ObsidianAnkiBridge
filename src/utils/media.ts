// https://stackoverflow.com/a/32263881/5036246
export function isVideo(src: string): Promise<boolean> {
    return new Promise(function (response, reject) {
        const video = createEl('video')
        video.preload = 'metadata'
        video.onloadedmetadata = function (evt) {
            response(!!(video.videoHeight && video.videoWidth))
        }
        video.onerror = reject
        video.src = src
    })
}
