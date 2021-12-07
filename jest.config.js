/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: [
    "node_modules",
    "src"
  ],

  transform: {
    "^.+\\.pegjs$": "esbuild-jest",
    "^.+\\.js\\.static$": "esbuild-jest",
    "^.+\\.svg_content$": "esbuild-jest"
  }
};