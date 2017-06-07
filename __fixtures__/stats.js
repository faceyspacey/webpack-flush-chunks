const chunk1Files = [
  '0.js',
  '0.no_css.js',
  '0.css',
  '0.js.map',
  '0.no_css.js.map',
  '0.css.map'
]
const chunk2Files = [
  '1.js',
  '1.no_css.js',
  '1.css',
  '1.js.map',
  '1.no_css.js.map',
  '1.css.map'
]
const chunk3Files = [
  '2.js',
  '2.no_css.js',
  '2.css',
  '2.js.map',
  '2.no_css.js.map',
  '2.css.map'
]

export const stats = {
  assetsByChunkName: {
    bootstrap: ['bootstrap.js', 'bootstrap.no_css.js'],
    vendor: ['vendor.js', 'vendor.no_css.js'],
    main: ['main.js', 'main.no_css.js', 'main.css'],
    chunk1: chunk1Files,
    chunk2: chunk2Files
  },
  chunks: [
    {
      id: 0,
      files: chunk1Files
    },
    {
      id: 1,
      files: chunk2Files
    },
    {
      id: 2,
      files: chunk3Files
    }
    // chunk with id: 3 intentionally missing to test against invalid stats
  ],
  modules: [
    {
      id: 'qwer',
      name: './src/Components/Example.js',
      chunks: [0]
    },
    {
      id: 'asdf',
      name: './src/Components/Foo.js',
      chunks: [1]
    },
    {
      id: 'zxcv',
      name: './src/Components/Bar.js',
      chunks: [2]
    },
    {
      id: 'fgij',
      name: './src/Components/Baz.js',
      chunks: [3]
    }
  ],
  publicPath: '/static/'
}

export const babelFilePaths = [
  './src/Components/Example.js',
  './src/Components/Foo.js',
  './src/Components/Bar.js',
  './src/Components/Baz.js'
]

export const webpackModuleIds = ['qwer', 'asdf', 'zxcv', 'fgij']

export const rootDir = '/Users/jamesgillmore/App'

export const chunkNames = ['chunk1', 'chunk2']
