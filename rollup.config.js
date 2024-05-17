const typescript = require('@rollup/plugin-typescript');

module.exports = {
  input: './index.ts',
  output: [
    { dir: './lib', entryFileNames: 'index.js', format: 'cjs' },
    { dir: './lib', entryFileNames: 'index.mjs', format: 'es' },
  ],
  plugins: [typescript()],
};
