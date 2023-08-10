import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Preprocessor } from 'ankibridge/processors/preprocessors/base'
import { stripCr } from 'ankibridge/utils/file'
import { parseLinktext, Notice, resolveSubpath } from 'obsidian'

export class EmbedPreprocessor extends Preprocessor {
    /**
     * Preprocesses embedded blocks and headings, replacing them with the corresponding markdown
     */
    static id = 'EmbedPreprocessor'
    static displayName = 'EmbedPreprocessor'
    static weight = 20
    static defaultConfigState = true

    public async preprocess(
        note: NoteBase,
        strField: string | null,
        ctx: ProcessorContext,
    ): Promise<string | null> {
        if (strField !== null) {
            const embedRegex = /!\[(.*?)]\((.*?)\)/gis;
            for (const match of strField.matchAll(embedRegex)) {
            const result = parseLinktext(match[2]);
            const subpath = result.subpath.replace(/%20/gis, " ");
            Notice(("Match is " + match[2] + " linkpath is" + result.path + " subpath is " + subpath), 5e3);
            if (result.path == "") {
                var file = this.app.vault.getAbstractFileByPath(note.source.file.path);
                Notice(("File is " + file.name), 5e3);
            } else {
                var file = this.app.vault.getAbstractFileByPath(result.path);
                Notice(("File is " + file.name), 5e3);
            }
            const cache = this.app.metadataCache.getFileCache(file);
            Notice(("Cache headings are " + cache.headings[1].heading), 5e3);
            const loc = resolveSubpath(cache, subpath);
            Notice(("Location is " + loc.start.line + ", " + loc.end.line), 5e3);
            const filetext = stripCr(this.app.vault.read(file));
            const splitLines = filetext.split("\n");
            const filetextlines = splitLines.slice(loc.start.line, loc.end.line).join("\n");
            Notice(("File text is " + filetextlines), 5e3);
            strField = strField.replace(match[0], filetextlines);
            Notice(("New StrField is " + strField), 5e3);
            }
        }
        return strField
    }
}