/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // moduleDirectories: [
  //   "src"
  // ],

  transform: {
    "^.+\\.pegjs$": "esbuild-jest",
    "^.+\\.js\\.static$": "esbuild-jest",
    "^.+\\.svg_content$": "esbuild-jest",
    "^.+\\.html$": "esbuild-jest"
  }
};