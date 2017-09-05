// @noflow
import { flushChunks } from '../src/flushChunks'

import {
  stats,
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
})
