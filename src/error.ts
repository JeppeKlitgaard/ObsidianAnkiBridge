// Credit: SilentVoid13's Templater

export class AnkiBridgeError extends Error {
    constructor(msg: string, public console_msg?: string) {
        super(msg)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}
