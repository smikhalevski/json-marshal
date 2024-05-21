const typescript = require('@rollup/plugin-typescript');

module.exports = {
  input: [
    './src/main/index.ts',
    './src/main/adapter/arrayBuffer.ts',
    './src/main/adapter/date.ts',
    './src/main/adapter/error.ts',
    './src/main/adapter/regexp.ts',
  ],
  output: [
    { format: 'cjs', entryFileNames: '[name].js', dir: './lib', preserveModules: true },
    { format: 'es', entryFileNames: '[name].mjs', dir: './lib', preserveModules: true },
  ],
  plugins: [typescript({ tsconfig: './tsconfig.build.json' })],
};
