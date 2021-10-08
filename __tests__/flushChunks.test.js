// @noflow
import {
  flushChunks,
  flushFilesPure,
  flushBabel,
  flushWebpack,
  createFilesByPath,
  createFilesByModuleId,
  isUnique,
  normalizePath,
  concatFilesAtKeys,
  filesFromChunks
} from '../src/flushChunks'

import {
  stats,
  statsV5,
  rootDir,
  babelFilePaths,
  webpackModuleIds,
  chunkNames
} from '../__fixtures__/stats'

/** PUBLIC API */

describe('flushChunks() called as pure function', () => {
  it('babel: uses default entries when no named chunks provided via opts.before/after', () => {
    const files = flushChunks(stats, false, {
      moduleIds: babelFilePaths,
      rootDir
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('webpack: uses default entries when no named chunks provided via opts.before/after', () => {
    const files = flushChunks(stats, true, {
      moduleIds: webpackModuleIds
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('babel: uses entries provided by opts.before/after', () => {
    const files = flushChunks(stats, false, {
      moduleIds: babelFilePaths,
      before: ['vendor'],
      after: ['main'],
      rootDir
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('webpack: uses entries provided by opts.before/after', () => {
    const files = flushChunks(stats, true, {
      moduleIds: webpackModuleIds,
      before: ['vendor'],
      after: ['main']
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('babel - chunkNames', () => {
    const files = flushChunks(stats, false, {
      chunkNames,
      rootDir
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('webpack - chunkNames', () => {
    const files = flushChunks(stats, true, {
      chunkNames
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('webpack v5 - chunkNames', () => {
    const files = flushChunks(statsV5, true, {
      chunkNames: ['routeA']
    }) /*? */

    expect(files).toMatchSnapshot()
  })
})

describe('flushFiles() called as a pure function', () => {
  it('babel - moduleIds', () => {
    const files = flushFilesPure(stats, false, {
      moduleIds: babelFilePaths,
      rootDir
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('webpack - moduleIds', () => {
    const files = flushFilesPure(stats, true, {
      moduleIds: webpackModuleIds
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('babel - chunkNames', () => {
    const files = flushFilesPure(stats, false, {
      chunkNames,
      rootDir
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('webpack - chunkNames', () => {
    const files = flushFilesPure(stats, true, {
      chunkNames
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('filter: by string (file extension)', () => {
    const files = flushFilesPure(stats, true, {
      chunkNames,
      filter: 'css'
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('filter: by function', () => {
    const files = flushFilesPure(stats, true, {
      chunkNames,
      filter: file => /\.css$/.test(file)
    }) /*? */

    expect(files).toMatchSnapshot()
  })

  it('filter: by regex', () => {
    const files = flushFilesPure(stats, true, {
      chunkNames,
      filter: /\.css$/
    }) /*? */

    expect(files).toMatchSnapshot()
  })
})

describe('unit tests', () => {
  /** BABEL VS. WEBPACK FLUSHING */

  test('flushBabel()', () => {
    const files = flushBabel(babelFilePaths, stats, rootDir) /*? */
    const allFiles = stats.chunks[0].files.concat(
      stats.chunks[1].files,
      stats.chunks[2].files
    )
    expect(files).toEqual(allFiles)
  })

  test('flushWebpack()', () => {
    const files = flushWebpack(webpackModuleIds, stats) /*? */
    const allFiles = stats.chunks[0].files.concat(
      stats.chunks[1].files,
      stats.chunks[2].files
    )
    expect(files).toEqual(allFiles)
  })

  test('flushBabel() throws with no rootDir argument', () => {
    const flush = () => flushBabel(babelFilePaths, stats) /*? */
    expect(flush).toThrow()
  })

  /** CREATE FILES MAP */

  test('createFilesByPath()', () => {
    const filesByPath = createFilesByPath(stats) /*? */

    expect(Object.keys(filesByPath)).toEqual(babelFilePaths)

    const files = stats.chunks[0].files
    expect(filesByPath['./src/Components/Example.js']).toEqual(files)
    expect(filesByPath['./src/Components/Baz.js']).toEqual([]) // test against arrays of undefined

    expect(filesByPath).toMatchSnapshot()
  })

  test('createFilesByModuleId()', () => {
    const filesByPath = createFilesByModuleId(stats) /*? */

    expect(Object.keys(filesByPath)).toEqual(webpackModuleIds)

    const files = stats.chunks[0].files
    expect(filesByPath.qwer).toEqual(files)
    expect(filesByPath.fgij).toEqual([]) // test against arrays of undefined

    expect(filesByPath).toMatchSnapshot()
  })

  /** HELPERS */

  test('isUnique()', () => {
    let filtered = [1, 2, 2].filter(isUnique)
    expect(filtered).toEqual([1, 2])

    filtered = [1, 2, 3].filter(isUnique)
    expect(filtered).toEqual([1, 2, 3])
  })

  test('normalizePath()', () => {
    const path = '/Users/jamesgillmore/App/src/Components/Example.js'
    const normalizedPath = normalizePath(path, rootDir)

    expect(normalizedPath).toEqual('./src/Components/Example.js')
  })

  test('concatFilesAtKeys()', () => {
    const filesMap = {
      './src/Components/Example.js': ['0.js', '0.css'],
      './src/Components/Foo.js': ['1.js', '1.css'],
      './src/Components/Bar.js': ['2.js', '2.css']
    }
    const paths = ['./src/Components/Example.js', './src/Components/Bar.js']
    const files = concatFilesAtKeys(filesMap, paths)

    expect(files).toEqual(['0.js', '0.css', '2.js', '2.css'])
  })

  test('filesFromChunks()', () => {
    const entryNames = ['bootstrap', 'vendor', 'main']
    const assetsByChunkName = {
      bootstrap: ['bootstrap.js'],
      main: ['main.js', 'main.css']
    }
    const outputFiles = filesFromChunks(entryNames, { assetsByChunkName })

    expect(outputFiles).toEqual(['bootstrap.js', 'main.js', 'main.css'])
  })
})
