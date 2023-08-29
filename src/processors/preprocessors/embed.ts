import { NoteBase } from 'ankibridge/notes/base'
import { ProcessorContext } from 'ankibridge/processors/base'
import { Preprocessor } from 'ankibridge/processors/preprocessors/base'
import { stripCr } from 'ankibridge/utils/file'
import { link } from 'fs'
import { TFile, parseLinktext, resolveSubpath, Notice, stripHeading } from 'obsidian'

export class EmbedPreprocessor extends Preprocessor {
    /**
     * Preprocesses embedded blocks and headings, replacing them with the corresponding markdown
     */
    static id = 'EmbedPreprocessor'
    static displayName = 'EmbedPreprocessor'
    static weight = 20
    static defaultConfigState = true

    private async replaceEmbeddedBlocks(strField: string, note: NoteBase): Promise<string> {
        const embedRegex_md = /!\[([^\[]*?)]\((.*?)\)/gis;
        const embedRegex_wiki = /!\[\[(.*?)\]\]/gis;
        let file: TFile | null = null;
        
        for (const match of strField.matchAll(embedRegex_md)) {
            const result = parseLinktext(match[2]);
            const subpath = result.subpath.replace(/%20/gis, " ");
            const path = result.path.replace(/%20/gis, " ");
            if (path == "") {
                // Check if path is a Tfile
                if (note.source.file instanceof TFile) {
                    file = note.source.file;
                } else {
                    throw new Error(`Could not find embed: ${match[0]} for file: ${note.source.file.path} - path does not exist or is not Tfile`);
                }
            } else if (path.contains("md")) {
                // Check if path is a Tfile
                const abstractFile = this.app.metadataCache.getFirstLinkpathDest(path, "");
                if (abstractFile instanceof TFile) {
                    file = abstractFile;
                } else {
                    throw new Error(`Could not find embed: ${match[0]} for file: ${note.source.file.path} - path does not exist or is not Tfile`);
                }
            } else {
                continue
            }
            if (file !== null) {
                const cache = this.app.metadataCache.getFileCache(file);
                if (cache !== null) {
                    const loc = resolveSubpath(cache, subpath);
                    if (loc !== null) {
                        const filetext = stripCr(await this.app.vault.read(file));
                        const splitLines = filetext.split("\n");
                        if (loc.end !== null) {
                            const filetextlines = splitLines.slice(loc.start.line, loc.end.line).join("\n");
                            strField = strField.replace(match[0], filetextlines);
                        } else {
                            const filetextlines = splitLines.slice(loc.start.line).join("\n");
                            strField = strField.replace(match[0], filetextlines);
                        }
                    } else {
                        throw new Error(`Could not find embed: ${match[0]} for file: ${note.source.file.path} - subpath could not be resolved`);
                    }
                } else {
                    throw new Error(`Could not find embed: ${match[0]} for file: ${note.source.file.path} ' - cache is null'`);
                }
            }
        }
    
        for (const match of strField.matchAll(embedRegex_wiki)) {
            const linkstring = match[1] as string;
            // Extract subpath from display text, just in case 
            const linktext = linkstring.split("|")[0];
            const result = parseLinktext(linktext);
            const subpath = result.subpath;
            const path = result.path;
            if (path == "") {
                // Check if path is a Tfile
                if (note.source.file instanceof TFile) {
                    file = note.source.file;
                } else {
                    throw new Error(`Could not find embed: ${match[0]} for file: ${note.source.file.path} - path does not exist or is not Tfile`);
                }
            } else {
                // Check if path is a Tfile
                const abstractFile = this.app.metadataCache.getFirstLinkpathDest(path, "");
                if (abstractFile instanceof TFile) {
                    file = abstractFile;
                } else {
                    // Assumes that embedded file is not a Tfile, rather than not existing - could use better error handling here to cover this
                    continue
                }
            }
            if (file !== null) {
                const cache = this.app.metadataCache.getFileCache(file);
                if (cache !== null) {
                    const loc = resolveSubpath(cache, subpath);
                    if (loc !== null) {
                        const filetext = stripCr(await this.app.vault.read(file));
                        const splitLines = filetext.split("\n");
                        if (loc.end !== null) {
                            const filetextlines = splitLines.slice(loc.start.line, loc.end.line).join("\n");
                            strField = strField.replace(match[0], filetextlines);
                        } else {
                            const filetextlines = splitLines.slice(loc.start.line).join("\n");
                            strField = strField.replace(match[0], filetextlines);
                        }
                    } else {
                        throw new Error(`Could not find embed: ${match[0]} for file: ${note.source.file.path} - subpath ${subpath} could not be resolved`);
                    }    
                } else {
                    throw new Error(`Could not find embed: ${match[0]} for file: ${note.source.file.path} ' - cache is null'`);
                }
            }
        }
    
        return strField;
    }

    public async preprocess(
        note: NoteBase,
        strField: string | null,
        ctx: ProcessorContext,
    ): Promise<string | null> {
        if (strField !== null) {
            strField = await this.replaceEmbeddedBlocks(strField, note);
        }
        return strField;
    }
}