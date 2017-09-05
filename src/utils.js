export const isWebpack = () => typeof __webpack_require__ !== 'undefined'
export const requireReactWeakly = () => {
  if (!isWebpack()) {
    return module.require('react')
  }
  return __webpack_require__(require.resolveWeak('react'))
}

export default {
  isWebpack,
  requireReactWeakly
}
