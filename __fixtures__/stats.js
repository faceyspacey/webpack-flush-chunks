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

export const statsV5 = {
  publicPath: 'auto',
  assetsByChunkName: {
    main: ['main.js'],
    routeA: ['routeA.js'],
    routeB: ['routeB.js']
  },
  chunks: [
    {
      files: ['main.js'],
      id: 'main'
    },
    {
      files: ['routeA.js'],
      id: 'routeA'
    },
    {
      files: ['routeB.js'],
      id: 'routeB'
    },
    {
      files: ['vendors-node_modules_react-dom_index_js.js'],
      id: 'vendors-node_modules_react-dom_index_js'
    }
  ],
  modules: [
    {
      id: 138,
      name: './src/entry.js',
      chunks: ['main']
    },
    {
      id: 3,
      name: './src/routeA.js',
      chunks: ['routeA']
    },
    {
      id: 642,
      name: './src/routeB.js',
      chunks: ['routeB']
    },
    {
      id: 294,
      name: './node_modules/react/index.js',
      chunks: ['vendors-node_modules_react-dom_index_js']
    },
    {
      id: 935,
      name: './node_modules/react-dom/index.js',
      chunks: ['vendors-node_modules_react-dom_index_js']
    },
    {
      id: 408,
      name: './node_modules/react/cjs/react.production.min.js',
      chunks: ['vendors-node_modules_react-dom_index_js']
    },
    {
      id: 448,
      name: './node_modules/react-dom/cjs/react-dom.production.min.js',
      chunks: ['vendors-node_modules_react-dom_index_js']
    },
    {
      id: 418,
      name: './node_modules/object-assign/index.js',
      chunks: ['vendors-node_modules_react-dom_index_js']
    },
    {
      id: 840,
      name: './node_modules/scheduler/index.js',
      chunks: ['vendors-node_modules_react-dom_index_js']
    },
    {
      id: 53,
      name: './node_modules/scheduler/cjs/scheduler.production.min.js',
      chunks: ['vendors-node_modules_react-dom_index_js']
    },
    {
      id: '',
      name: 'webpack/runtime/ensure chunk',
      chunks: ['main']
    },
    {
      id: '',
      name: 'webpack/runtime/get javascript chunk filename',
      chunks: ['main']
    },
    {
      id: '',
      name: 'webpack/runtime/global',
      chunks: ['main']
    },
    {
      id: '',
      name: 'webpack/runtime/hasOwnProperty shorthand',
      chunks: ['main']
    },
    {
      id: '',
      name: 'webpack/runtime/jsonp chunk loading',
      chunks: ['main']
    },
    {
      id: '',
      name: 'webpack/runtime/load script',
      chunks: ['main']
    },
    {
      id: '',
      name: 'webpack/runtime/make namespace object',
      chunks: ['main']
    },
    {
      id: '',
      name: 'webpack/runtime/publicPath',
      chunks: ['main']
    }
  ],
  namedChunkGroups: {
    main: {
      name: 'main',
      chunks: ['main']
    },
    routeA: {
      name: 'routeA',
      chunks: ['vendors-node_modules_react-dom_index_js', 'routeA']
    },
    routeB: {
      name: 'routeB',
      chunks: ['vendors-node_modules_react-dom_index_js', 'routeB']
    }
  }
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
