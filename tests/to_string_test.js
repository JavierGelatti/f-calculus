const { suite, test, assert } = require('@pmoo/testy')

const { primitive } = require('../src/ast')
const { parseExpression } = require('../src/parser')

suite('string representation', () => {
    test('application', () => {
        assert.that(parseExpression('f x').toString()).
            isEqualTo('(f x)')
    })

    test('abstraction', () => {
        assert.that(parseExpression('(λx.x)').toString()).
            isEqualTo('(λx.x)')
    })

    test('let expression', () => {
        assert.that(parseExpression('let x = y. z').toString()).
            isEqualTo('let x = y. z')
    })

    test('number literals', () => {
        assert.that(parseExpression('3').toString()).
            isEqualTo('3')
    })

    test('infix operators', () => {
        assert.that(parseExpression('x + y').toString()).isEqualTo('x + y')
    })

    test('js values', () => {
        assert.that(primitive(x => x).toString()).isEqualTo('<primitive: x => x>')
        assert.that(primitive(x => x, 'stuff').toString()).isEqualTo('stuff')
    })
})
