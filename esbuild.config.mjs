import esbuild from "esbuild";
import process from "process";

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source visit the plugins github repository
*/
`;

const prod = (process.argv[2] === 'production');

esbuild.build({
    banner: {
        js: banner,
    },
    entryPoints: ['src/main.ts'],
    bundle: true,
    external: ['obsidian'],
    platform: 'node',
    format: 'cjs',
    watch: !prod,
    target: 'es2016',
    logLevel: "info",
    loader: {
        ".pegjs": "text",
        ".js.static": "text",
        ".svg_content": "text",
    },
    sourcemap: prod ? false : 'inline',
    treeShaking: true,
    outfile: 'main.js',
}).catch(() => process.exit(1));