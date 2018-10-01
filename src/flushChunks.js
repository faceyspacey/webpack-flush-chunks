// @flow
import type { Api, CssChunksHash } from './createApiWithCss'
import createApiWithCss from './createApiWithCss'

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
  assetsByChunkName: Object,
  namedChunkGroups: FilesMap,
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

type Options2 = {
  moduleIds?: Files,
  chunkNames?: Files,
  rootDir?: string,
  filter?: string | Function | RegExp
}

let filesByPath = null
let filesByModuleId = null

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
  const ffc = (assets, isWebpack) => filesFromChunks(assets, stats, isWebpack)

  const jsBefore = ffc(beforeEntries)

  const files = opts.chunkNames
    ? ffc(opts.chunkNames, true)
    : flush(opts.moduleIds || [], stats, opts.rootDir, isWebpack)

  const afterEntries = opts.after || defaults.after
  const jsAfter = ffc(afterEntries)

  return createApiWithCss(
    [...jsBefore, ...files, ...jsAfter].filter(isUnique),
    [
      ...jsBefore, // likely nothing in here, but if so: bootstrap.css, vendor.css, etc
      ...jsAfter.reverse(), // main.css, someElseYouPutBeforeMain.css, etc
      ...files // correct incrementing order already
    ].filter(isUnique),
    stats,
    opts.outputPath
  )
}

const flushFiles = (stats: Stats, opts: Options2) =>
  flushFilesPure(stats, IS_WEBPACK, opts)

const flushFilesPure = (stats: Stats, isWebpack: boolean, opts: Options2) => {
  const files = opts.chunkNames
    ? filesFromChunks(opts.chunkNames, stats)
    : flush(opts.moduleIds || [], stats, opts.rootDir, isWebpack)

  const filter = opts.filter

  if (filter) {
    if (typeof filter === 'function') {
      return files.filter(filter)
    }

    const regex = filter instanceof RegExp ? filter : new RegExp(`.${filter}$`)
    return files.filter(file => regex.test(file))
  }

  return files
}

/** BABEL VS. WEBPACK FLUSHING */

const flush = (
  moduleIds: Files,
  stats: Stats,
  rootDir: ?string,
  isWebpack: boolean
) =>
  (!isWebpack
    ? flushBabel(moduleIds, stats, rootDir).filter(isUnique)
    : flushWebpack(moduleIds, stats).filter(isUnique))

const flushBabel = (paths: Files, stats: Stats, rootDir: ?string): Files => {
  if (!rootDir) {
    throw new Error(
      `No \`rootDir\` was provided as an option to \`flushChunks\`.
      Please provide one so modules rendered server-side can be
      paired to their webpack equivalents client-side, and their
      corresponding chunks.`
    )
  }

  const dir = rootDir // satisfy flow

  filesByPath = filesByPath && !IS_TEST
    ? filesByPath // cached
    : createFilesByPath(stats)

  return concatFilesAtKeys(filesByPath, paths.map(p => normalizePath(p, dir)))
}

const flushWebpack = (ids: Files, stats: Stats): Files => {
  filesByModuleId = filesByModuleId && !IS_TEST
    ? filesByModuleId // cached
    : createFilesByModuleId(stats)

  return concatFilesAtKeys(filesByModuleId, ids)
}

/** CREATE FILES MAP */
const filesByChunk = chunks =>
  chunks.reduce((chunks, chunk) => {
    chunks[chunk.id] = chunk.files
    return chunks
  }, {})

const createFilesByPath = ({ chunks, modules }: Stats): FilesMap => {
  const chunkedFiles = filesByChunk(chunks)
  return modules.reduce((filesByPath, module) => {
    const filePath = module.name
    const files = concatFilesAtKeys(chunkedFiles, module.chunks)

    filesByPath[filePath] = files.filter(isUnique)
    return filesByPath
  }, {})
}

const createFilesByModuleId = (stats: Stats): FilesMap => {
  const filesByPath = createFilesByPath(stats)

  return stats.modules.reduce((filesByModuleId, module) => {
    const filePath = module.name
    const id = module.id

    filesByModuleId[id] = filesByPath[filePath]
    return filesByModuleId
  }, {})
}

const findChunkById = ({ chunks }) => {
  if (!chunks) {
    return {}
  }
  return filesByChunk(chunks)
}

/** HELPERS */

const isUnique = (v: string, i: number, self: Files): boolean =>
  self.indexOf(v) === i

const normalizePath = (path: string, rootDir: string): string =>
  `${path.replace(rootDir, '.').replace(/\.js$/, '')}.js`

const concatFilesAtKeys = (
  inputFilesMap: FilesMap,
  pathsOrIdsOrChunks: Array<any>
): Files =>
  pathsOrIdsOrChunks.reduce(
    (files, key) => files.concat(inputFilesMap[key] || []),
    []
  )

const filesByChunkName = (name, namedChunkGroups) => {
  if (!namedChunkGroups || !namedChunkGroups[name]) {
    return [name]
  }

  return namedChunkGroups[name].chunks
}

const hasChunk = (entry, assets, checkChunkNames) => {
  const result = !!(assets[entry] || assets[`${entry}-`])
  if (!result && checkChunkNames) {
    console.warn(
      `[FLUSH CHUNKS]: Unable to find ${entry} in Webpack chunks. Please check usage of Babel plugin.`
    )
  }

  return result
}

const chunksToResolve = ({
  chunkNames,
  stats,
  checkChunkNames
}: {
  chunkNames: Files,
  stats: Object,
  checkChunkNames?: boolean
}): Array<string> =>
  chunkNames
    .reduce((names, name) => {
      if (!hasChunk(name, stats.assetsByChunkName, checkChunkNames)) {
        return names
      }
      const files = filesByChunkName(name, stats.namedChunkGroups)
      names.push(...files)
      return names
    }, [])
    .filter(isUnique)

const filesFromChunks = (
  chunkNames: Files,
  stats: Object,
  checkChunkNames?: boolean
): Files => {
  const chunksByID = findChunkById(stats)

  const entryToFiles = entry => {
    if (typeof entry === 'number') {
      return chunksByID[entry]
    }
    return (
      stats.assetsByChunkName[entry] || stats.assetsByChunkName[`${entry}-`]
    )
  }

  const chunksWithAssets = chunksToResolve({
    chunkNames,
    stats,
    checkChunkNames
  })

  return [].concat(...chunksWithAssets.map(entryToFiles)).filter(chunk => chunk)
}

/** EXPORTS FOR TESTS */

export {
  flushChunks,
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
}
