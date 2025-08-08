const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('@rollup/plugin-typescript')
const dts = require('rollup-plugin-dts')
const path = require('path')
const copy = require('rollup-plugin-copy')
const terser = require('@rollup/plugin-terser')

const external = ['react', 'react-dom', 'tsyringe', 'react/jsx-runtime', '@vue/reactivity']

const plugins = [
  resolve(),
  commonjs(),
  typescript({
    tsconfig: path.join(__dirname, './tsconfig.json'),
  }),
  copy({
    targets: [
      { src: path.join(__dirname, 'package.json'), dest: joinDistPath() },
      { src: path.join(__dirname, '../../README.md'), dest: joinDistPath() },
    ],
  }),
  // terser(),
]

const input = path.join(__dirname, './src/index.ts')

function joinDistPath(...paths) {
  return path.join(__dirname, '../../dist/impair', ...paths)
}

module.exports = [
  // Main builds
  {
    input,
    output: [
      {
        file: joinDistPath('index.js'),
        format: 'esm',
        sourcemap: true,
      },
      {
        file: joinDistPath('index.cjs'),
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
      file: joinDistPath('index.d.ts'),
      format: 'es',
    },
    external,
    plugins: [dts.default()],
  },
]
