const { suite, test, assert } = require('@pmoo/testy')

const { parseExpression } = require('../src/parser')

suite('string representation', () => {
    test('application', () => {
        assert.that(parseExpression("f x").toString()).
            isEqualTo("(f x)")
    })

    test('abstraction', () => {
        assert.that(parseExpression("(λx.x)").toString()).
        isEqualTo("(λx.x)")
    })

    test('let expression', () => {
        assert.that(parseExpression("let x = y. z").toString()).
        isEqualTo("let x = y. z")
    })
})