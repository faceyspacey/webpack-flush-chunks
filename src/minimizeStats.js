export default stats => {
  const {
    assetsByChunkName,
    namedChunkGroups,
    chunks,
    modules,
    publicPath
  } = stats

  return Object.assign(
    {},
    {
      assetsByChunkName,
      namedChunkGroups,
      publicPath
    },
    {
      chunks: chunks.map(({ id, files }) => ({ id, files })),
      modules: modules.map(({ id, name, chunks }) => ({ id, name, chunks }))
    }
  )
}
