// @flow
import type { Api, CssChunksHash } from './createApiWithCss'
import createApiWithCss from './createApiWithCss'
import { filesFromChunks, flush } from './flushFiles'

declare function __webpack_require__(id: string): any

type Files = Array<string>

export type FilesMap = {
  [key: string]: Array<string>
}

type Chunk = {
  id: number,
  files: Array<string>
}

type Module = {
  id: string,
  name: string,
  chunks: Array<number>
}

export type Stats = {
  assetsByChunkName: FilesMap,
  chunks: Array<Chunk>,
  modules: Array<Module>,
  publicPath: string
}

type Options = {
  moduleIds?: Files,
  chunkNames?: Files,
  before?: Array<string>,
  after?: Array<string>,
  rootDir?: string,
  outputPath?: string
}

const IS_WEBPACK = typeof __webpack_require__ !== 'undefined'
const IS_TEST = process.env.NODE_ENV === 'test'
const defaults = {
  before: ['bootstrap', 'vendor'],
  after: ['main']
}

/** PUBLIC API */

export default (stats: Stats, opts: Options): Api =>
  flushChunks(stats, IS_WEBPACK, opts)

const flushChunks = (stats: Stats, isWebpack: boolean, opts: Options = {}) => {
  const beforeEntries = opts.before || defaults.before
  const jsBefore = filesFromChunks(beforeEntries, stats.assetsByChunkName)

  const files = opts.chunkNames
    ? filesFromChunks(opts.chunkNames, stats.assetsByChunkName, true)
    : flush(opts.moduleIds || [], stats, opts.rootDir, isWebpack)

  const afterEntries = opts.after || defaults.after
  const jsAfter = filesFromChunks(afterEntries, stats.assetsByChunkName)

  return createApiWithCss(
    [...jsBefore, ...files, ...jsAfter],
    [
      ...jsBefore, // likely nothing in here, but if so: bootstrap.css, vendor.css, etc
      ...jsAfter.reverse(), // main.css, someElseYouPutBeforeMain.css, etc
      ...files // correct incrementing order already
    ],
    stats,
    opts.outputPath
  )
}

export { flushChunks }
export {
  flushFiles,
  flushFilesPure,
  flush,
  flushBabel,
  flushWebpack,
  createFilesByPath,
  createFilesByModuleId,
  isUnique,
  normalizePath,
  concatFilesAtKeys,
  filesFromChunks
} from './flushFiles'
