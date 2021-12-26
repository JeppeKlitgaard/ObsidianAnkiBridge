import { NoteBase } from 'notes/base'
import { MarkdownRenderer } from 'obsidian'
import { ProcessorContext } from './base'

export async function processMarkdownToHtml(
    note: NoteBase,
    field: string,
    ctx: ProcessorContext,
): Promise<HTMLTemplateElement> {
    // Can't directly use template due to the way MarkdownRenderer works
    const body = createEl('body')
    await MarkdownRenderer.renderMarkdown(field, body, '', null)

    const template = createEl('template')
    template.innerHTML = body.innerHTML

    return template
}
