import { requireReactWeakly } from '../src/utils'

describe('requireReactWeakly', () => {
  it('requires react module weakly', () => {
    const React = requireReactWeakly()
    /*
    This will cause warnings while running npm test since it access all properties of React to snapshot it and some properties as deprecated
    warnings:
    console.warn node_modules\react\lib\lowPriorityWarning.js:40
      Warning: Accessing PropTypes via the main React package is deprecated, and will be removed in  React v16.0. Use the latest available v15.* prop-types package from npm instead. For info on
 usage, compatibility, migration and more, see https://fb.me/prop-types-docs
    console.warn node_modules\react\lib\lowPriorityWarning.js:40
      Warning: Accessing createClass via the main React package is deprecated, and will be removed in React v16.0. Use a plain JavaScript class instead. If you're not yet ready to migrate, crea
te-react-class v15.* is available on npm as a temporary, drop-in replacement. For more info see https://fb.me/react-create-class
    */
    expect(React).toMatchSnapshot()
    /* ---- */
    /* that's the only function necessary */
    expect(React.createElement).toBeInstanceOf(Function)
  })
})
