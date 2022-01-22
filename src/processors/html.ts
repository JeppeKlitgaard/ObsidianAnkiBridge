import { ProcessorContext } from 'ankibridge/processors/base'
import { Component, MarkdownRenderer } from 'obsidian'

import { NoteBase } from '../notes/base'

export async function processMarkdownToHtml(
    note: NoteBase,
    field: string | null,
    ctx: ProcessorContext,
): Promise<HTMLTemplateElement> {
    // Can't directly use template due to the way MarkdownRenderer works
    const body = createEl('body')

    if (field !== null) {
        await MarkdownRenderer.renderMarkdown(field, body, '', {} as Component)
    }

    const template = createEl('template')
    template.innerHTML = body.innerHTML

    return template
}
