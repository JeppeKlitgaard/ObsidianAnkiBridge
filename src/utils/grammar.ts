import { Plugin, Vault } from 'obsidian'

export async function makeGrammar(
    grammar: string,
    libraries: Array<string>,
    vault: Vault,
    plugin: Plugin,
): Promise<string> {
    const utilsJs = await vault.adapter.read(plugin.manifest.dir + '/assets/grammars/utils.js')

    let finalGrammar = ''
    finalGrammar += '{{\n'
    finalGrammar += utilsJs
    finalGrammar += '\n}}\n'

    finalGrammar += '\n\n'

    finalGrammar += grammar

    finalGrammar += '\n\n'

    await Promise.all(
        libraries.map(async (grammarName) => {
            const libGrammar = await readGrammar(vault, plugin, grammarName)
            finalGrammar += `// LIBRARY: ${grammarName}\n`
            finalGrammar += libGrammar
        }),
    )

    return finalGrammar
}

export async function readGrammar(
    vault: Vault,
    plugin: Plugin,
    grammarName: string,
): Promise<string> {
    const grammar = await vault.adapter.read(
        plugin.manifest.dir + '/assets/grammars/' + grammarName + '.pegjs',
    )
    return grammar
}
