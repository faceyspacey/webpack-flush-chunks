// @noflow
import {
  default as createApiWithCss,
  getJsFileRegex,
  isJs,
  isCss,
  stylesAsString
} from '../src/createApiWithCss'

jest.mock('fs', () => ({
  readFileSync: fileName =>
    `${fileName}- the css! \n/*# sourceMappingURL=/static/main.js.map */`
}))

const publicPath = '/static/'
const outputPath = '/Users/jamesgillmore/App/build'

/** CREATE API WITH CSS */

describe('createApiWithCss()', () => {
  it('generates js + style components, strings and arrays', () => {
    const files = ['0.js', '0.css', 'main.js', 'main.css']
    const filesForCss = ['main.js', 'main.css', '0.js', '0.css']
    const api = createApiWithCss(
      files,
      filesForCss,
      publicPath,
      outputPath
    ) /*? $ */

    expect(api.Js() /*? $.props.children */).toMatchSnapshot()
    expect(api.Styles() /*? $.props.children */).toMatchSnapshot()
    expect(api.Css() /*? $.props */).toMatchSnapshot()

    expect(`${api.js}` /*? */).toMatchSnapshot()
    expect(`${api.styles}` /*? */).toMatchSnapshot()
    expect(`${api.css}` /*? */).toMatchSnapshot()

    expect(api.scripts /*? $ */).toMatchSnapshot()
    expect(api.stylesheets /*? $ */).toMatchSnapshot()

    expect(api.publicPath).toEqual(publicPath.replace(/\/$/, ''))
    expect(api.outputPath).toEqual(outputPath)
  })

  it('uses files with extension "no_css.js" if available', () => {
    const files = ['main.js', 'main.no_css.js', 'main.css']
    const api = createApiWithCss(files, files, publicPath, outputPath) /*? $ */

    expect(api.Js() /*? $.props.children */).toMatchSnapshot()
    expect(api.Styles() /*? $.props.children */).toMatchSnapshot()
    expect(api.Css() /*? $.props */).toMatchSnapshot()

    expect(`${api.js}` /*? */).toMatchSnapshot()
    expect(`${api.styles}` /*? */).toMatchSnapshot()
    expect(`${api.css}` /*? */).toMatchSnapshot()

    expect(api.scripts /*? $ */).toMatchSnapshot()
    expect(api.stylesheets /*? $ */).toMatchSnapshot()

    expect(api.publicPath).toEqual(publicPath.replace(/\/$/, ''))
    expect(api.outputPath).toEqual(outputPath)
  })

  it('throws when rendering css without outputPath', () => {
    const files = ['main.js', 'main.css']
    const api = createApiWithCss(files, files, publicPath)

    expect(api.Css /*? */).toThrow()
    expect(api.css.toString /*? */).toThrow()
  })

  it('adds trailing slash to public path', () => {
    const files = ['main.js']
    const publicPath = '/static'
    const api = createApiWithCss(files, files, publicPath)

    expect(api.js.toString() /*? */).toContain('/static/main.js')
  })

  it('does not include scripts with extension "hot-update.js"', () => {
    const files = ['main.js', 'main.hot-update.js']
    const api = createApiWithCss(files, files, publicPath)

    expect(api.scripts /*? */).not.toContain('main.hot-update.js')
  })
})

/** HELPERS */

describe('unit tests', () => {
  test('getJsFileRegex()', () => {
    let files = ['main.no_css.js', 'main.js', 'main.css']
    let regex = getJsFileRegex(files)
    expect(regex).toEqual(/\.no_css\.js$/)

    files = ['main.js', 'main.css']
    regex = getJsFileRegex(files)
    expect(regex).toEqual(/\.js$/)
  })

  test('isJs()', () => {
    const jsRegex = /\.js$/
    const noCssRegex = /\.no_css\.js$/

    expect(isJs(jsRegex, 'main.js')).toEqual(true)
    expect(isJs(noCssRegex, 'main.js')).toEqual(false)

    expect(isJs(noCssRegex, 'main.no_css.js')).toEqual(true)
    expect(isJs(noCssRegex, 'main.js')).toEqual(false)

    expect(isJs(jsRegex, 'main.hot-update.js')).toEqual(false)
    expect(isJs(noCssRegex, 'main.hot-update.js')).toEqual(false)
  })

  test('isCss()', () => {
    expect(isCss('main.css')).toEqual(true)
    expect(isCss('main.js')).toEqual(false)
  })

  test('stylesAsString()', () => {
    const stylesheets = ['main.css', '0.css']
    const css = stylesAsString(stylesheets, outputPath) /*? $ */
    expect(css).toMatchSnapshot()
  })
})
