import utilsJs from 'grammars/utils.js.static'

export async function makeGrammar(
    grammar: string,
    libraries: Record<string, string>,
): Promise<string> {
    let finalGrammar = ''
    finalGrammar += '{{\n'
    finalGrammar += utilsJs
    finalGrammar += '\n}}\n'

    finalGrammar += '\n\n'

    finalGrammar += grammar

    finalGrammar += '\n\n'

    for (const [grammarName, grammar] of Object.entries(libraries)) {
        finalGrammar += `// LIBRARY: ${grammarName}\n`
        finalGrammar += grammar
    }

    return finalGrammar
}
