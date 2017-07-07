# Webpack Flush Chunks [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/faceyspacey/Lobby)

<p align="center">
  <a href="https://www.npmjs.com/package/webpack-flush-chunks">
    <img src="https://img.shields.io/npm/v/webpack-flush-chunks.svg" alt="Version" />
  </a>

  <a href="https://travis-ci.org/faceyspacey/webpack-flush-chunks">
    <img src="https://travis-ci.org/faceyspacey/webpack-flush-chunks.svg?branch=master" alt="Build Status" />
  </a>

  <a href="https://lima.codeclimate.com/github/faceyspacey/webpack-flush-chunks/coverage">
    <img src="https://lima.codeclimate.com/github/faceyspacey/webpack-flush-chunks/badges/coverage.svg" alt="Coverage Status"/>
  </a>

  <a href="https://greenkeeper.io">
    <img src="https://badges.greenkeeper.io/faceyspacey/webpack-flush-chunks.svg" alt="Green Keeper" />
  </a>

  <a href="https://lima.codeclimate.com/github/faceyspacey/webpack-flush-chunks">
    <img src="https://lima.codeclimate.com/github/faceyspacey/webpack-flush-chunks/badges/gpa.svg" alt="GPA" />
  </a>

  <a href="https://www.npmjs.com/package/webpack-flush-chunks">
    <img src="https://img.shields.io/npm/dt/webpack-flush-chunks.svg" alt="Downloads" />
  </a>

  <a href="https://www.npmjs.com/package/webpack-flush-chunks">
    <img src="https://img.shields.io/npm/l/webpack-flush-chunks.svg" alt="License" />
  </a>

  <a href="https://gitter.im/webpack-flush-chunks">
    <img src="https://img.shields.io/gitter/room/nwjs/nw.js.svg" alt="Gitter Chat" />
  </a>
</p>

![webpack-flush-chunks](https://raw.githubusercontent.com/faceyspacey/redux-first-router/master/docs/poo.jpg)

Use this package server-side to flush webpack chunks from *[React Universal Component](https://github.com/faceyspacey/react-universal-component)* or any package that flushes an array of rendered `moduleIds` or `chunkNames`.

```js
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'

const app = ReactDOMServer.renderToString(<App />)
const { js, styles, cssHash } = flushChunks(webpackStats, {
  chunkNames: flushChunkNames()
})

res.send(`
  <!doctype html>
  <html>
    <head>
      ${styles}
    </head>
    <body>
      <div id="root">${app}</div>
      ${js}
      ${cssHash}
    </body>
  </html>
`)
```

The code has been cracked for while now for Server Side Rendering and Code-Splitting *individually*. Accomplishing both *simultaneously* has been an impossibility without jumping through major hoops or using a *framework*, specifically Next.js.

*Webpack Flush Chunks* is essentially the backend to universal rendering components like [React Universal Component](https://github.com/faceyspacey/react-universal-component). It works with any "universal" component/module that buffers a list of `moduleIds` or `chunkNames` evaluated. 

Via a simple API it gives you the chunks (javascript, stylesheets, etc) corresponding to the modules that were ***synchronously*** rendered on the server, which otherwise are *asynchronously* rendered on the client. In doing so, it also allows your first client-side render on page-load to render those otherwise async components ***synchronously***! 

This solves the problem of either having to make additional requests to get async components or React checksum mismatches when you do in fact correctly synchronously render the component server-side and send it to the client, but where the client expects to render a `<Loading />` component.

It offers 2 functions `flushChunks` and `flushFiles`, which are the equivalent of `ReactDOMServer.renderToString` when it comes to code-splitting. They are used in server-rendering to extract the minimal amount of chunks to send to the client, thereby solving a missing piece for code-splitting: server-side rendering. 

It's a companion package to **React Universal Component** or any code splitting package that flushes an array of module ids or paths rendered on the server. It's very flexible and allows for all the common configurations we can currently think of.

The dream of **code-splitting everywhere** is finally here.

**Medium Release Article:**

https://medium.com/@faceyspacey/code-cracked-for-code-splitting-ssr-in-reactlandia-react-loadable-webpack-flush-chunks-and-1a6b0112a8b8

## Installation

```
yarn add react-universal-component webpack-flush-chunks 
```

Optionally to generate multiple CSS files for each chunk (with HMR!) install:
```
yarn add --dev extract-css-chunks-webpack-plugin
```

***Extract Css Chunks Webpack Plugin*** is another companion package made to complete the CSS side of the code-splitting dream. It uses the `cssHash` string to asynchronously request CSS assets as part of a "dual import" when calling `import()`. To learn more visit: [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin) and [babel-plugin-dual-import](https://github.com/faceyspacey/babel-plugin-dual-import).

*...if you like to move fast, visit the [boilerplates section](#boilerplates).*

## How It Works

*React Universal Component*, when used on the server, skips the *loading* phase and syncronously renders your contained component, while recording the ID of 
its corresponding module. *React Universal Component* may be used multiple times and therefore may record multiple split points. `flushChunks/flushFiles` is then able 
to determine the minimal set of chunks required to re-render those modules/components on the client. From there it outputs strings or React components 
containing the precise javascript files (and CSS files) to embed in your HTML response. 

The result is a server-rendered response whose *"checksum"* 
matches the one generated on the client, so that another client render is not needed, and more importantly so that another request to the server for
an additional chunk is not needed.

Before we examine how to use `flushChunks/flushFiles`, let's take a look at the desired output. It's something like this:

```html
<head>
  <link rel='stylesheet' href='/static/0.css' />
  <link rel='stylesheet' href='/static/7.css' />
  <link rel='stylesheet' href='/static/main.css' />
</head> 

<body>
  <div id="react-root"></div>

  <!-- before entry chunks -->
  <script type='text/javascript' src='/static/bootstrap.js'></script>
  <script type='text/javascript' src='/static/vendor.js'></script>

  <!-- dynamic chunks -->
  <script type='text/javascript' src='/static/0.js'></script>
  <script type='text/javascript' src='/static/7.js'></script>

  <!-- after entry chunks -->
  <script type='text/javascript' src='/static/main.js'></script>
</body>
```

> Notice common `vendor` and `bootstrap` chunks at the beginning and your main entry bundle (`main`) at the end. 
Notice that chunks `0` and `7` are served, but not chunks `1-6` or `8+`. That's a lot of bytes saved in initial requests!

Because of the way Webpack works where "bootstrap" code must be run before any additional chunks can be registered, 
it's imperative bootstrap and common chunks are generated and placed at the beginning, 
thereby allowing you to place dynamic chunks before your entry chunk which kickstarts app rendering. *This is a key gotcha
and takeaway anyone who's pursued this route comes upon.*

In conjunction with your Webpack configuration (which we'll specify [below](#webpack-configuration)), *Webpack Flush Chunks* solves these problems for you by consuming your Webpack compilation `stats` and generating strings and components you can embed in the final output rendered on the server.


## Usage (if not using Webpack's "magic comments" for chunk names)

Call `ReactUniversalComponent.flushModuleIds` immediately after `ReactDOMServer.renderToString`, and then pass the returned `moduleIds` plus your Webpack client bundle's 
compilation stats to `flushChunks`. The return object of `flushChunks` will provide several options you can embed in your response string. The easiest is the `js` and `styles` strings: 

```js
import ReactDOMServer from 'react-dom/server'
import { flushModuleIds } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'

const app = ReactDOMServer.renderToString(<App />)
const moduleIds = flushModuleIds()
const { js, styles, cssHash } = flushChunks(stats, { moduleIds })

res.send(`
  <!doctype html>
  <html>
    <head>
      ${styles}
    </head>
    <body>
      <div id="root">${app}</div>
      ${js}
      ${cssHash}
    </body>
  </html>
`)
```


**As of Webpack 2.4.1 (released spring 2017) you can the new "magic comments" feature to name chunks created by `import()`:**

*src/components/App.js:*
```js
import universal from 'react-universal-component'

const UniversalComponent = universal(() => import(/* webpackChunkName: 'chunk-1' */ '../components/Foo'), {
  resolve: () => require.resolveWeak('./Foo'),
  chunkName: 'chunk-1'
})

export default () =>
  <div>
    <UniversalComponent />
  </div>
```

*server/render.js:*

```js
import ReactDOMServer from 'react-dom/server'
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'

const app = ReactDOMServer.renderToString(<App />)
const chunkNames = flushChunkNames()
const { js, styles, cssHash } = flushChunks(stats, { chunkNames })

res.send(`
  <!doctype html>
  <html>
    <head>
      ${styles}
    </head>
    <body>
      <div id="root">${app}</div>
      ${js}
      ${cssHash}
    </body>
  </html>
`)
```

*et voila!*

> Note: if you require a less automated approach where you're given just the stylesheets and scripts corresponding to dynamic chunks (e.g. not `main.js`), see `flushFiles` in the [the low-level API section](#low-level-api-flushfiles).

## Options API:

```js
flushChunks(stats, {
  moduleIds: ReactUniversalComponent.flushModuleIds(),

  // or:
  // chunkNames: ReactUniversalComponent.flushChunkNames(), // not both

  // optional:
  before: ['bootstrap', 'vendor'],                // default
  after: ['main'],                                // default
  rootDir: path.resolve(__dirname, '..'),         // required only for a Babel-compiled server not using chunkNames
  outputPath: path.resolve(__dirname, '../dist'), // required only if you want to serve raw CSS
})
```

If you are rendering *both your client and server with webpack* and using the *default 
names* for entry chunks, **only `moduleIds` or `chunkNames` are required**. If you're rendering the server with Babel and not using `chunkNames`,  `rootDir` is also required. Here is a description of all possible options:

- **before** - ***array of named entries that come BEFORE your dynamic chunks:*** A typical 
pattern is to create a `vendor` chunk. A better strategy is to create a `vendor` and a `bootstrap` chunk. The "bootstrap"
chunk is a name provided to the `CommonsChunkPlugin` which has no entry point specified for it. The plugin by default removes 
webpack bootstrap code from the named `vendor` common chunk and puts it in the `bootstrap` chunk. This is a common pattern because
the webpack bootstrap code has info about the chunks/modules used in your bundle and is likely to change, which means to cache
your `vendor` chunk you need to extract the bootstrap code into its own small chunk file. If this is new to you, don't worry.
[Below](#webpack-configuration) you will find examples for exactly how to specify your Webpack config. Lastly, you do not need to 
provide this option if you have a `bootstrap` chunk, or `vendor` chunk or both, as those are the defaults.

- **after** - ***array of named entries that come AFTER your dynamic chunks:*** 
Similar to `before`, `after` contains an array of chunks you want to come after the dynamic chunks that
your universal component flushes. Typically you have just a `main` chunk, and if that's the case, you can ignore this option,
as that's the default.

- **rootDir** - ***absolute path to the directory containing your package.json file:*** If you are rendering your server code with Webpack as well, this option can be ignored. However, if
you're rendering the server with Babel, you **must** provide the root directory of your app so
modules rendered by Babel on the server can be linked to their equivalents rendered by Webpack on the client. So for example, if your
client entry script is `app/src/index.js`, and you're calling `flushChunks` from `app/server/render.js`, you will want 
to pass `path.join(__dirname, '..')`, which is essentially `app/`. We recommend you checkout and run  
[one of our boilerplates](#boilerplates) for a clear example.

- **outputPath** - ***absolute path to the directory containing your client build:*** This is only needed if serving css 
embedded in your served response HTML, rather than links to external stylesheets. *See [below](#3-css-instead-of-stylesheets) 
for how to do this.* It's needed to determine where in the file system to find the CSS that needs to be extract into
an in-memory string. Keep in mind if you're rendering the server with Webpack, filesystem paths may not match up, so it's important
to accurately pass the `outputPath` to your `serverRender` method. We recommend to do this by running your server 
express/koa/hapi/etc code via Babel and then by requiring your Webpack server bundle into it. 
See [one of our boilerplates](#boilerplates) for an example.


## Return API:

The return of `flushChunks` provides many options to render server side requests, giving you maximum flexibility:

```js
const {
  // react components:
  Js,     // javascript chunks
  Styles, // external stylesheets
  Css,    // raw css

  // strings:
  js,     // javascript chunks
  styles, // external stylesheets
  css,    // raw css

  // arrays of file names:
  scripts,
  stylesheets,

  // cssHash for use with babel-plugin-dual-import
  cssHashRaw, // hash object of chunk names to css file paths
  cssHash,    // string: <script>window.__CSS_CHUNKS__ = ${JSON.stringify(cssHashRw)}</script>
  CssHash,    // react component of above

  // important paths:
  publicPath,
  outputPath
} = flushChunks(moduleIds, stats, options)
```

Let's take a look at some examples:





## Webpack Configuration

In addition to providing a plethora of options for rendering server-side requests, **Webpack Flush Chunks** has been made to be a complete and comprehensive solution to all the Webpack and Babel bundling/compilation strategies you might take. We got you covered. Let's examine our recommended Webpack configs for a variety of situations:


## UNIVERSAL WEBPACK (CLIENT + SERVER):

### Client Development
```js
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin')

entry: [
  path.resolve(__dirname, '../src/index.js'),
],
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: 'babel-loader',
    },
    {
      test: /\.css$/,
      use: ExtractCssChunks.extract({
        use: {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[name]__[local]--[hash:base64:5]'
          }
        }
      })
    }
  ]
},
plugins: [
  new ExtractCssChunks,                     // key to producing CSS chunks -- see below!
  // new webpack.NamedModulesPlugin(),      // only required if using moduleIds
  new webpack.optimize.CommonsChunkPlugin({
    names: ['bootstrap'],                   // notice there is no "bootstrap" named entry
    filename: '[name].js',
    minChunks: Infinity
  })
  ...
```

When using `moduleIds`, the key element above is the `namedModulesPlugin` which insures the module IDs generated for your
client bundle are the same for your server bundle (aka "deterministic"). 

The `CommonsChunkPlugin` with a `"bootstrap"` entry ***which doesn't exist*** insures that a separate chunk is created just for webpack bootstrap code. 
This moves the webpack bootstrap code out of your `main` entry chunk so that it can also run before your dynamic
chunks. Lastly, the `ExtractCssChunks` plugin insures CSS also gets multiple
CSS files created. If you're familiar with how `extract-text-webpack-plugin` works, you will be right at home. Check out [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin) 
to learn more.




### Server Development
```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: 'babel-loader',
    },
    {
      test: /\.css$/,
      exclude: /node_modules/,
      use: {
        loader: 'css-loader/locals',          // notice you're using the `locals` file as your loader
        options: {
          modules: true,
          localIdentName: '[name]__[local]--[hash:base64:5]'
        }
      }
    }
  ]
}
plugins: [
  // new webpack.NamedModulesPlugin(),          // only required if not using chunkNames
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1,                               // the server MUST only have one bundle file
  })
  ...
```

The `LimitChunkCountPlugin` with `maxChunks: 1` insures only one file is generated for your server bundle
so it can be run synchronously. And again `NamedModulesPlugin` insures module IDs with the same names
as your client bundle are flushed. It's only needed when using `flushModuleIds`(), not `flushChunkNames()`.

### Client Production
```js
// loaders + entries stay the same
plugins: [
  new require('stats-webpack-plugin')('stats.json'),  // VERY IMPORTANT! `flushChunks` consumes this
  new ExtractCssChunks,
  // new webpack.HashedModuleIdsPlugin(),             // don't expose file system in production bundle
  new webpack.optimize.CommonsChunkPlugin({
    names: ['bootstrap'],
    filename: '[name].[chunkhash].js',
    minChunks: Infinity
  })
  ...
```

In production `HashedModuleIdsPlugin` is used so that you don't expose your file system for the names
of modules, as `NamedModulesPlugin` creates module IDs like: `'./src/Components/App.js'`. Again, it's
not needed if you're flushing `chunkNames` directly.

`stats-webpack-plugin` is instrumental in producing a `stats.json` file in your build directory, from
which stats can be read in production. During development, this is done in code. See [how to get stats](#how-to-get-stats) below.

### Server Production
```js
// loaders + entries stay the same
plugins: [
  // new webpack.HashedModuleIdsPlugin(),
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1
  }),
  ...
```

One final note on `HashedModuleIdsPlugin` and `NamedModulesPlugin`. If you're using them, they obviously must match between the client and server.
Both the client and server must have the same way to deterministically determine module ids/names, so they can be cross-referenced to determine
which chunks to flush.


## Webpack on the Client and Babel on The Server:

Now, not all of you are using Webpack to compile your server code (although we recommend you do--see our 
[nice universal webpack setup](#boilerplates) in our boilerplate section). So for those that are not, 
here is the configs for your client bundles, and the solution we recommend for handling CSS on the server:


*.babelrc*:
```
{
  "presets": ["es2015", "react", "stage-2"],
  "plugins": ["dynamic-import-webpack", [
     "css-modules-transform", {
       "generateScopedName": "[name]__[local]--[hash:base64:5]"
     }
  ]]
}
```

**[babel-plugin-dynamic-import-webpack](https://github.com/airbnb/babel-plugin-dynamic-import-webpack)** is needed to transpile `import()` into Webpack's `require.ensure` on the server. It requires Babylon v6.12.0. It won't do anything without running within Webpack, but it guards against transpilation errors--and this is fine since components aren't imported asynchronously on the server.
*Also note: if you're using a version of Webpack prior to 2.2.0 you also need this.* 


More importantly, since you can't rely on webpack anymore to handle importing CSS, we recommend using 
[babel-plugin-css-modules-transform](https://github.com/michalkvasnicak/babel-plugin-css-modules-transform) 
to generate CSS class names on the server. What it does is take code like this:

```js
import styles from '../css/Foo.css'
export default () => <div className={styles.box} />
```

and transpiles it to:

```html
<div class="../css/Foo__box--asdfe" />
```
*And it does so without creating CSS files, as that's handled by Webpack bundling the client code.* Your `generatedScopedName` (e.g. `"[name]__[local]--[hash:base64:5]"`) must match your
`localIdentName` that you pass to Webpack's `css-loader`.

Now that we are using this babel transform, pay close attention to how we must override its `.babelrc` in your client webpack config:

### Client Development
```js
entry: [
  path.resolve(__dirname, '../src/index.js')
],
module: {
  rules: [
    {
      // when building the server with Babel, we must override babelrc
      // since the babelrc powering Node on the server uses "css-modules-transform"
      // which breaks/conflicts_with ExtractCssChunks + css-loader:
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: ['es2015', 'react', 'stage-2'],
          plugins: [
            // 'dynamic-import-webpack' // only needed if  Webpack version < 2.2.0
            // notice there is no 'css-modules-transform' plugin!
          ]
        }
      }
    },
    {
      test: /\.css$/,
      use: ExtractCssChunks.extract({
        use: {
          loader: 'css-loader',         
          options: {
            modules: true,
            localIdentName: '[name]__[local]--[hash:base64:5]'
          }
        }
      })
    }
  ]
},
plugins: [
  new ExtractCssChunks,
  new webpack.optimize.CommonsChunkPlugin({
    names: ['bootstrap'],
    filename: '[name].js',
    minChunks: Infinity
  })
  ...
```

### Client Production
```js
// loaders + entries stay the same
plugins: [
  new ExtractCssChunks,
  new webpack.optimize.CommonsChunkPlugin({
    names: ['bootstrap'],
    filename: '[name].[chunkhash].js',
    minChunks: Infinity,
  }),
  new StatsPlugin('stats.json'),
  ...
```

> Note: hashed or named module plugins are never needed with Babel, as Babel paths are deterministically used instead.

## How to Get Stats

The general premise is to run your webpack compiler in code rather than from the command line. By doing so,
you get access to your client bundle's stats in a callback. Let's go over both a Babel and a Webpack example:


**Babel:**

*server/index.js:*
```js
const DEV = process.env.NODE_ENV === 'development'
const publicPath = clientConfig.output.publicPath
const outputPath = clientConfig.output.path
const app = express()

if (DEV) {
  const compiler = webpack(clientConfig)

  app.use(webpackDevMiddleware(compiler, { publicPath }))
  app.use(webpackHotMiddleware(compiler))

  // where you get the stats during development:
  compiler.plugin('done', stats => {
    app.use(serverRender({ clientStats: stats.toJson(), outputPath }))
  })
}
else {
  const clientStats = require('../build/stats.json')

  app.use(publicPath, express.static(outputPath))
  app.use(serverRender({ clientStats, outputPath }))
}
```

> **note:** a callback can be passed to `webpack(config, stats => ...)`, but it does not provide the complete set 
of stats as the `done` plugin callback does. Do NOT use it!

In this case `serverRender` is a function you call once with the stats that returns a function that 
can be used by express on every request:

*server/render.js:*
```js
export default stats => {
  return (req, res, next) => {
    const app = ReactDOMServer.renderToString(<App />)
    const moduleIds = flushModuleIds()
    const { Js Styles} = flushChunks(stats, {
      moduleIds,
      rootDir: path.join(__dirname, '..')
    })
    ...
```

**Webpack:**

```js
if (DEV) {
  const multiCompiler = webpack([clientConfig, serverConfig])
  const clientCompiler = multiCompiler.compilers[0]

  app.use(webpackDevMiddleware(multiCompiler, { publicPath }))
  app.use(webpackHotMiddleware(clientCompiler))

  // the amazingly sick webpack-hot-server-middleware:
  app.use(
    // keeps serverRender updated with arg: { clientStats, outputPath }
    webpackHotServerMiddleware(multiCompiler, {
      serverRendererOptions: { outputPath }
    })
  )
}
else {
  const clientStats = require('../buildClient/stats.json')
  const serverRender = require('../buildServer/main.js').default

  app.use(publicPath, express.static(outputPath))
  app.use(serverRender({ clientStats, outputPath }))
}
```

For Webpack, we use the amazingly awesome [webpack-hot-server-middleware](https://github.com/60frames/webpack-hot-server-middleware) by **@richardscarrott**. I can't recommend it enough. It's the most idiomatic (and fastest) approach to Hot Module Replacement on the server I've ever seen.


## Externals
If you're specifying externals to leave unbundled, you need to tell Webpack
to still bundle `react-universal-component`, `webpack-flush-chunks` and
`require-universal-module` so that they know they are running
within Webpack. For example:

```js
const externals = fs
  .readdirSync(modeModules)
  .filter(x => !/\.bin|react-universal-component|require-universal-module|webpack-flush-chunks/.test(x))
  .reduce((externals, mod) => {
    externals[mod] = `commonjs ${mod}`
    return externals
  }, {})
```

## Boilerplates
It should be clear by now that the main work in using `webpack-flush-chunks` is not in application code, but in setting up your
webpack configs. It's therefore extremely important that you're armed with the precise boilerplates for the route you're taking. Here they are:

- **[Universal Webpack Boilerplate](https://github.com/faceyspacey/flush-chunks-boilerplate-webpack)**
- **[Universal Webpack Boilerplate (using chunkNames + magic comments)](https://github.com/faceyspacey/flush-chunks-boilerplate-webpack-chunknames)**
- [Babel Boilerplate](https://github.com/faceyspacey/flush-chunks-boilerplate-babel)
- [Babel Boilerplate (using chunkNames + magic comments)](https://github.com/faceyspacey/flush-chunks-boilerplate-babel-chunknames)

After checking out the above boilerplates, clicking around their files, and running the different setups (development, production, babel server, etc), how to use *Webpack Flush Chunks* should make sense,
and you should have a fool-proof place to start from.

ONE FINAL TIME: clone & run the boilerplates before using this package!

## Low-level API: `flushFiles`
For advanced users that want access to all files flushed (`.js`, `.css` or whatever else might be in there) and without named entry chunks you already know (such as `bootstrap`, `vendor`, and `main`), here you go:

```js
import { flushChunkNames } from 'react-universal-component/server'
import { flushFiles } from 'webpack-flush-chunks'

const chunkNames = flushChunkNames()
const scripts = flushFiles(stats, { chunkNames, filter: 'js' })
const styles = flushFiles(stats, { chunkNames, filter: 'css' })
```
> i.e. this will get you all files corresponding to flushed "dynamic" chunks, not `main`, `vendor`, etc. 

The only thing different with the API is that it has a `filter` option, and that it doesn't have `before`, `after` and `outputPath` options. The `filter` can be a file extension as a string, a regex, or a function: `filter: file => file.endsWith('js')`.

Keep in mind, you will have to get right placing these between your `bootstrap` and `main` scripts. ***OR*** if you don't have a `bootstrap` script, you need to set it up so your `main` script doesn't actually call `ReactDOM.render`, and instead you put `<script>window.render()</script>` (where `window.render()` calls `ReactDOM.render`) after all your chunks in your markup so that by the time it's called all your chunks are loaded. In the latter case, you should put your dynamic chunks received from `flushFiles` **after** your `main` script so that the webpack bootstrap code *now within your `main` script* (as it regularly is) knows what to do with the additional scripts from dynamic chunks.

If what you want, instead of file names, is full-on compilation `chunk` objects (and any information it contains, which for 99% of most projects is unnecessary), create an issue and we'll add it. But until there is an actual need, we would like to keep the API simple.


## Contributing


We use [commitizen](https://github.com/commitizen/cz-cli), so run `npm run cm` to make commits. A command-line form will appear, requiring you answer a few questions to automatically produce a nicely formatted commit. Releases, semantic version numbers, tags, changelogs and publishing to NPM will automatically be handled based on these commits thanks to [semantic-release](https://github.com/semantic-release/semantic-release). Be good.


## Tests

Reviewing a package's tests are a great way to get familiar with it. It's direct insight into the capabilities of the given package (if the tests are thorough). What's even better is a screenshot of the tests neatly organized and grouped (you know the whole "a picture says a thousand words" thing). 

Below is a screenshot of this module's tests running in [Wallaby](https://wallabyjs.com) *("An Integrated Continuous Testing Tool for JavaScript")* which everyone in the React community should be using. It's fantastic and has taken my entire workflow to the next level. It re-runs your tests on every change along with comprehensive logging, bi-directional linking to your IDE, in-line code coverage indicators, **and even snapshot comparisons + updates for Jest!** I requestsed that feature by the way :). It's basically a substitute for live-coding that inspires you to test along your journey.

![require-universal-module wallaby tests screenshot](./tests-screenshot.png)
