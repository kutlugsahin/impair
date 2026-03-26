const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('@rollup/plugin-typescript')
const terser = require('@rollup/plugin-terser')
const copy = require('rollup-plugin-copy')
const path = require('path')

function distPath(...paths) {
  return path.join(__dirname, '../../dist/impair-devtools', ...paths)
}

const tsPlugin = () =>
  typescript({
    tsconfig: path.join(__dirname, 'tsconfig.json'),
    noEmit: false,
    declaration: false,
    outDir: distPath(),
  })

// Inline replace plugin for process.env.NODE_ENV (avoids @rollup/plugin-replace dependency)
function replaceEnv() {
  return {
    name: 'replace-env',
    transform(code) {
      if (code.includes('process.env.NODE_ENV')) {
        return {
          code: code.replace(/process\.env\.NODE_ENV/g, JSON.stringify('production')),
          map: null,
        }
      }
      return null
    },
  }
}

const commonPlugins = [
  replaceEnv(),
  resolve(),
  commonjs(),
  terser(),
]

module.exports = [
  // Background service worker (IIFE)
  {
    input: path.join(__dirname, 'src/background.ts'),
    output: {
      file: distPath('background.js'),
      format: 'iife',
      sourcemap: true,
    },
    plugins: [...commonPlugins, tsPlugin()],
  },
  // Content script (IIFE)
  {
    input: path.join(__dirname, 'src/content-script.ts'),
    output: {
      file: distPath('content-script.js'),
      format: 'iife',
      sourcemap: true,
    },
    plugins: [...commonPlugins, tsPlugin()],
  },
  // DevTools page (IIFE)
  {
    input: path.join(__dirname, 'src/devtools-page.ts'),
    output: {
      file: distPath('devtools-page.js'),
      format: 'iife',
      sourcemap: true,
    },
    plugins: [...commonPlugins, tsPlugin()],
  },
  // Panel (ESM - bundles React for the extension)
  {
    input: path.join(__dirname, 'src/panel/index.tsx'),
    output: {
      file: distPath('panel/index.js'),
      format: 'esm',
      sourcemap: true,
    },
    external: [],
    plugins: [
      ...commonPlugins,
      tsPlugin(),
      copy({
        targets: [
          { src: path.join(__dirname, 'manifest.json'), dest: distPath() },
          { src: path.join(__dirname, 'src/devtools-page.html'), dest: distPath() },
          { src: path.join(__dirname, 'src/panel/index.html'), dest: distPath('panel') },
        ],
      }),
    ],
  },
]
