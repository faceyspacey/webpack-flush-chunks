import { requireReactWeakly } from '../src/utils'

describe('requireReactWeakly', () => {
  it('requires react module weakly', () => {
    const React = requireReactWeakly()
    /* that's the only function necessary */
    expect(React.createElement).toBeInstanceOf(Function)
  })
})
