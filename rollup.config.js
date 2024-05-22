const typescript = require('@rollup/plugin-typescript');

module.exports = {
  input: [
    './src/main/index.ts',
    './src/main/adapter/array-buffer.ts',
    './src/main/adapter/date.ts',
    './src/main/adapter/error.ts',
    './src/main/adapter/map.ts',
    './src/main/adapter/regexp.ts',
    './src/main/adapter/set.ts',
  ],
  output: [
    { format: 'cjs', entryFileNames: '[name].js', dir: './lib', preserveModules: true },
    { format: 'es', entryFileNames: '[name].mjs', dir: './lib', preserveModules: true },
  ],
  plugins: [typescript({ tsconfig: './tsconfig.build.json' })],
};
