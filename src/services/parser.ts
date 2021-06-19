import { ISettings } from 'settings'
import * as showdown from 'showdown'
import { Regex } from 'regex'
import { Flashcard } from 'entities/flashcard'
import { Inlinecard } from 'entities/inlinecard'
import { Spacedcard } from 'entities/spacedcard'
import { escapeMarkdown } from 'utils'

export class Parser {
    private regex: Regex
    private settings: ISettings
    private htmlConverter

    constructor(regex: Regex, settings: ISettings) {
        this.regex = regex
        this.settings = settings
        this.htmlConverter = new showdown.Converter()
        this.htmlConverter.setOption('simplifiedAutoLink', true)
        this.htmlConverter.setOption('tables', true)
        this.htmlConverter.setOption('tasks', true)
        this.htmlConverter.setOption('ghCodeBlocks', true)
        this.htmlConverter.setOption('requireSpaceBeforeHeadingText', true)
        this.htmlConverter.setOption('simpleLineBreaks', true)
    }

    public generateFlashcards(
        file: string,
        deck: string,
        vault: string,
        note: string,
        globalTags: string[] = [],
    ): Flashcard[] {
        const contextAware = this.settings.contextAwareMode
        let cards: Flashcard[] = []
        let headings: any = []

        if (contextAware) {
            // https://regex101.com/r/agSp9X/4
            headings = [...file.matchAll(this.regex.headingsRegex)]
        }

        note = this.substituteObsidianLinks(`[[${note}]]`, vault)
        cards = cards.concat(
            this.generateCardsWithTag(file, headings, deck, vault, note, globalTags),
        )
        cards = cards.concat(
            this.generateInlineCards(file, headings, deck, vault, note, globalTags),
        )
        cards = cards.concat(
            this.generateSpacedCards(file, headings, deck, vault, note, globalTags),
        )
        cards.sort((a, b) => a.endOffset - b.endOffset)

        return cards
    }

    /**
     * Gives back the ancestor headings of a line.
     * @param headings The list of all the headings available in a file.
     * @param line The line whose ancestors need to be calculated.
     * @param headingLevel The level of the first ancestor heading, i.e. the number of #.
     */
    private getContext(headings: any, index: number, headingLevel: number): string[] {
        const context: string[] = []
        let currentIndex: number = index
        let goalLevel = 6

        let i = headings.length - 1
        // Get the level of the first heading before the index (i.e. above the current line)
        if (headingLevel !== -1) {
            // This is the case of a #flashcard in a heading
            goalLevel = headingLevel - 1
        } else {
            // Find first heading and its level
            // This is the case of a #flashcard in a paragraph
            for (i; i >= 0; i--) {
                if (headings[i].index < currentIndex) {
                    currentIndex = headings[i].index
                    goalLevel = headings[i][1].length - 1

                    context.unshift(headings[i][2].trim())
                    break
                }
            }
        }

        // Search for the other headings
        for (i; i >= 0; i--) {
            const currentLevel = headings[i][1].length
            if (currentLevel == goalLevel && headings[i].index < currentIndex) {
                currentIndex = headings[i].index
                goalLevel = currentLevel - 1

                context.unshift(headings[i][2].trim())
            }
        }

        return context
    }

    private generateSpacedCards(
        file: string,
        headings: any,
        deck: string,
        vault: string,
        note: string,
        globalTags: string[] = [],
    ) {
        const contextAware = this.settings.contextAwareMode
        const cards: Spacedcard[] = []
        const matches = [...file.matchAll(this.regex.cardsSpacedStyle)]

        for (const match of matches) {
            const reversed = false
            let headingLevel = -1
            if (match[1]) {
                headingLevel = match[1].trim().length !== 0 ? match[1].trim().length : -1
            }
            // Match.index - 1 because otherwise in the context there will be even match[1], i.e. the question itself
            const context = contextAware
                ? this.getContext(headings, match.index - 1, headingLevel)
                : ''

            const originalPrompt = match[2].trim()
            let prompt = contextAware
                ? [...context, match[2].trim()].join(`${this.settings.contextSeparator}`)
                : match[2].trim()
            const imagesMedia: string[] = this.getImageLinks(prompt)
            prompt = this.parseLine(prompt, vault)

            const endingLine = match.index + match[0].length
            const tags: string[] = this.parseTags(match[4], globalTags)
            const id: number = match[5] ? Number(match[5]) : -1
            const inserted: boolean = match[5] ? true : false
            const fields: any = { Prompt: prompt }
            if (this.settings.sourceSupport) {
                fields['Source'] = note
            }
            const containsCode = this.containsCode([prompt])

            const card = new Spacedcard(
                id,
                deck,
                originalPrompt,
                fields,
                reversed,
                endingLine,
                tags,
                inserted,
                imagesMedia,
                containsCode,
            )
            cards.push(card)
        }

        return cards
    }

    private generateInlineCards(
        file: string,
        headings: any,
        deck: string,
        vault: string,
        note: string,
        globalTags: string[] = [],
    ) {
        const contextAware = this.settings.contextAwareMode
        const cards: Inlinecard[] = []
        const matches = [...file.matchAll(this.regex.cardsInlineStyle)]

        for (const match of matches) {
            if (
                match[2].toLowerCase().startsWith('cards-deck') ||
                match[2].toLowerCase().startsWith('tags')
            ) {
                continue
            }

            const reversed: boolean = match[3].trim().toLowerCase() === ':::'
            let headingLevel = -1
            if (match[1]) {
                headingLevel = match[1].trim().length !== 0 ? match[1].trim().length : -1
            }
            // Match.index - 1 because otherwise in the context there will be even match[1], i.e. the question itself
            const context = contextAware
                ? this.getContext(headings, match.index - 1, headingLevel)
                : ''

            const originalQuestion = match[2].trim()
            let question = contextAware
                ? [...context, match[2].trim()].join(`${this.settings.contextSeparator}`)
                : match[2].trim()
            let answer = match[4].trim()
            let imagesMedia: string[] = this.getImageLinks(question)
            imagesMedia = imagesMedia.concat(this.getImageLinks(answer))
            question = this.parseLine(question, vault)
            answer = this.parseLine(answer, vault)

            const endingLine = match.index + match[0].length
            const tags: string[] = this.parseTags(match[5], globalTags)
            const id: number = match[6] ? Number(match[6]) : -1
            const inserted: boolean = match[6] ? true : false
            const fields: any = { Front: question, Back: answer }
            if (this.settings.sourceSupport) {
                fields['Source'] = note
            }
            const containsCode = this.containsCode([question, answer])

            const card = new Inlinecard(
                id,
                deck,
                originalQuestion,
                fields,
                reversed,
                endingLine,
                tags,
                inserted,
                imagesMedia,
                containsCode,
            )
            cards.push(card)
        }

        return cards
    }

    private generateCardsWithTag(
        file: string,
        headings: any,
        deck: string,
        vault: string,
        note: string,
        globalTags: string[] = [],
    ) {
        const contextAware = this.settings.contextAwareMode
        const cards: Flashcard[] = []
        const matches = [...file.matchAll(this.regex.flashscardsWithTag)]

        for (const match of matches) {
            const reversed: boolean =
                match[3].trim().toLowerCase() === `#${this.settings.flashcardsTag}-reverse`
            const headingLevel = match[1].trim().length !== 0 ? match[1].length : -1
            // Match.index - 1 because otherwise in the context there will be even match[1], i.e. the question itself
            const context = contextAware
                ? this.getContext(headings, match.index - 1, headingLevel)
                : ''

            const originalQuestion = match[2].trim()
            let question = contextAware
                ? [...context, match[2].trim()].join(`${this.settings.contextSeparator}`)
                : match[2].trim()
            let answer = match[5].trim()
            let imagesMedia: string[] = this.getImageLinks(question)
            imagesMedia = imagesMedia.concat(this.getImageLinks(answer))
            question = this.parseLine(question, vault)
            answer = this.parseLine(answer, vault)

            const endingLine = match.index + match[0].length
            const tags: string[] = this.parseTags(match[4], globalTags)
            const id: number = match[6] ? Number(match[6]) : -1
            const inserted: boolean = match[6] ? true : false
            const fields: any = { Front: question, Back: answer }
            if (this.settings.sourceSupport) {
                fields['Source'] = note
            }
            const containsCode = this.containsCode([question, answer])

            const card = new Flashcard(
                id,
                deck,
                originalQuestion,
                fields,
                reversed,
                endingLine,
                tags,
                inserted,
                imagesMedia,
                containsCode,
            )
            cards.push(card)
        }

        return cards
    }

    public containsCode(str: string[]): boolean {
        for (const s of str) {
            if (s.match(this.regex.codeBlock)) {
                return true
            }
        }
        return false
    }

    public getCardsToDelete(file: string): number[] {
        // Find block IDs with no content above it
        return [...file.matchAll(this.regex.cardsToDelete)].map((match) => {
            return Number(match[1])
        })
    }

    private parseLine(str: string, vaultName: string) {
        return this.htmlConverter.makeHtml(
            this.mathToAnki(
                this.substituteObsidianLinks(this.substituteImageLinks(str), vaultName),
            ),
        )
    }

    private getImageLinks(str: string) {
        const wikiMatches = str.matchAll(this.regex.wikiImageLinks)
        const markdownMatches = str.matchAll(this.regex.markdownImageLinks)
        const links: string[] = []

        for (const wikiMatch of wikiMatches) {
            links.push(wikiMatch[1])
        }

        for (const markdownMatch of markdownMatches) {
            links.push(decodeURIComponent(markdownMatch[1]))
        }

        return links
    }

    private substituteObsidianLinks(str: string, vaultName: string) {
        const linkRegex = /\[\[(.+?)(?:\|(.+))?\]\]/gim
        vaultName = encodeURIComponent(vaultName)

        return str.replace(linkRegex, (match, filename, rename) => {
            const href = `obsidian://open?vault=${vaultName}&file=${encodeURIComponent(
                filename,
            )}.md`
            const fileRename = rename ? rename : filename
            const link = `<a href="${href}">[[${fileRename}]]</a>`
            return link
        })
    }

    private substituteImageLinks(str: string): string {
        str = str.replace(this.regex.wikiImageLinks, "<img src='$1'>")
        str = str.replace(this.regex.markdownImageLinks, "<img src='$1'>")

        return str
    }

    private mathToAnki(str: string) {
        const mathBlockRegex = /(\$\$)(.*?)(\$\$)/gis
        str = str.replace(mathBlockRegex, function (match, p1, p2) {
            return '\\\\(' + escapeMarkdown(p2) + ' \\\\)'
        })

        const mathInlineRegex = /(\$)(.*?)(\$)/gi
        str = str.replace(mathInlineRegex, function (match, p1, p2) {
            return '\\\\(' + escapeMarkdown(p2) + '\\\\)'
        })

        return str
    }

    private parseTags(str: string, globalTags: string[]): string[] {
        const tags: string[] = [...globalTags]

        if (str) {
            for (let tag of str.split('#')) {
                tag = tag.trim()
                if (tag) {
                    tags.push(tag)
                }
            }
        }

        return tags
    }

    public getAnkiIDsBlocks(file: string): RegExpMatchArray[] {
        return Array.from(file.matchAll(/\^(\d{13})\s*/gm))
    }
}
