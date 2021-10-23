// Credit: SilentVoid13's Templater

import { Notice } from 'obsidian'
import { AnkiBridgeError } from 'error'

export function logUpdate(msg: string): void {
    const notice = new Notice('', 15000)
    // TODO: Find better way for this
    // @ts-ignore
    notice.noticeEl.innerHTML = `<b>AnkiBridge Update</b>:<br/>${msg}`
}

export function logError(e: Error | AnkiBridgeError): void {
    const notice = new Notice('', 8000)

    if (e instanceof AnkiBridgeError && e.console_msg) {
        // TODO: Find a better way for this
        // @ts-ignore
        notice.noticeEl.innerHTML = `<b>AnkiBridge Error</b>:<br/>${e.message}<br/>Check console for more informations`
        console.error(`AnkiBridge Error:`, e.message, '\n', e.console_msg)
    } else {
        // @ts-ignore
        notice.noticeEl.innerHTML = `<b>AnkiBridge Error</b>:<br/>${e.message}`
    }
}
