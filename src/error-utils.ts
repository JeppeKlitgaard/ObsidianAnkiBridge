import { AnkiBridgeError } from 'ankibridge/error'
import { logError } from 'ankibridge/log'

export async function errorWrapper<T>(fn: () => Promise<T>, msg: string): Promise<T | null> {
    try {
        return await fn()
    } catch (e) {
        if (!(e instanceof AnkiBridgeError)) {
            logError(new AnkiBridgeError(msg, e.message))
        } else {
            logError(e)
        }
        return null
    }
}

export function errorWrapperSync<T>(fn: () => T, msg: string): T | null {
    try {
        return fn()
    } catch (e) {
        logError(new AnkiBridgeError(msg, e.message))
        return null
    }
}
