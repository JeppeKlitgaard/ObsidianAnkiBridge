import { MarkdownRenderer, Notice, Vault } from 'obsidian'

export function arraysEqual(a: string[], b: string[]) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false

    a.sort()
    b.sort()

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false
    }
    return true
}

export function escapeMarkdown(string: string, skips: string[] = []) {
    const replacements: Array<[RegExp, string, string]> = [
        [/\*/g, '\\*', 'asterisks'],
        [/#/g, '\\#', 'number signs'],
        [/\//g, '\\/', 'slashes'],
        [/\\/g, '\\\\', 'backslash'],
        [/\(/g, '\\(', 'parentheses'],
        [/\)/g, '\\)', 'parentheses'],
        [/\[/g, '\\[', 'square brackets'],
        [/\]/g, '\\]', 'square brackets'],
        [/</g, '&lt;', 'angle brackets'],
        [/>/g, '&gt;', 'angle brackets'],
        [/_/g, '\\_', 'underscores'],
    ]

    return replacements.reduce(function (string: string, replacement: any) {
        const name = replacement[2]
        return name && skips.indexOf(name) !== -1
            ? string
            : string.replace(replacement[0], replacement[1])
    }, string)
}

/**
 * Replaces \r with nothing.
 * @param {string} text - Text to strip
 * @return {string} Stripped text
 */
export function stripCr(text: string): string {
    return text.replace(/\r/g, '')
}

export function showError(message: string): void {
    new Notice('AnkiBridge Error: ' + message)
}

export function renderObsidianURIOpen(vault: Vault, file?: string, path?: string): string {
    const vaultStr = vault.getName()

    let selector: string
    if (file) {
        selector = 'file=' + encodeURIComponent(file)
    } else if (path) {
        selector = 'path=' + encodeURIComponent(path)
    } else {
        throw 'Must have either file or path'
    }

    const uri = `obsidian://open?vault=${vaultStr}&${selector}`

    return uri
}
interface RenderedLink {
    uri: string
    text: string
}

export function markdownLinkToTextAndHref(vault: Vault, markdownLink: string): RenderedLink {
    const el = createEl('div')
    MarkdownRenderer.renderMarkdown(markdownLink, el, '', null)
    const anchor = el.firstElementChild.firstElementChild

    const linkText = anchor.textContent
    const linkAddr = anchor.getAttribute('href')

    const uri = renderObsidianURIOpen(vault, linkAddr)

    return {
        uri: uri,
        text: linkText,
    }
}
