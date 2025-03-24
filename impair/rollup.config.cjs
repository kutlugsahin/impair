const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('@rollup/plugin-typescript')
const dts = require('rollup-plugin-dts')
const path = require('path')
const copy = require('rollup-plugin-copy')

const external = ['react', 'react-dom', 'tsyringe', '@vue/reactivity']

const plugins = [
  resolve(),
  commonjs(),
  typescript({
    tsconfig: path.join(__dirname, './tsconfig.json'),
  }),
  copy({
    targets: [{ src: path.join(__dirname, 'package.json'), dest: path.join(__dirname, '../dist') }],
  }),
]

const input = path.join(__dirname, './src/index.ts')

module.exports = [
  // Main builds
  {
    input,
    output: [
      {
        file: path.join(__dirname, '../dist/index.js'),
        format: 'esm',
        sourcemap: true,
      },
      {
        file: path.join(__dirname, '../dist/index.cjs'),
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external,
    plugins,
  },
  // Type definitions
  {
    input,
    output: {
      file: path.join(__dirname, '../dist/index.d.ts'),
      format: 'es',
    },
    external,
    plugins: [dts.default()],
  },
]
