const { template } = require('../../')

describe('simple bindings', () => {
  it('A simple binding will only evaluate the expressions without modifying the DOM structure', () => {
    const target = document.createElement('div')

    template('<p expr0><!----></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.text }},
        { type: 'attribute', name: 'class', evaluate(scope) { return scope.class }}
      ]
    }]).mount(target, { text: 'hello', class: 'foo' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p.getAttribute('class')).to.be.equal('foo')
    expect(p).to.be.ok
  })

  it('A simple bindings can be updated', () => {
    const target = document.createElement('div')
    const el = template('<p expr0><!----></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.text }},
        { type: 'attribute', name: 'class', evaluate(scope) { return scope.class }}
      ]
    }]).mount(target, { text: 'hello', class: 'foo' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p.getAttribute('class')).to.be.equal('foo')

    el.update({ text: 'world', class: 'bar' })

    expect(p.textContent).to.be.equal('world')
    expect(p.getAttribute('class')).to.be.equal('bar')
  })
})