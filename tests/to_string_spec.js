const { suite, test, assert } = require('@pmoo/testy')

const { parseExpression } = require('../src/parser')

suite('string representation', () => {
    test('application', () => {
        assert.that(parseExpression("f x").toString()).
            isEqualTo("(f x)")
    })

    test('abstraction', () => {
        assert.that(parseExpression("(λx.x)").toString()).
            // isEqualTo("(λx.x)")
            isEqualTo("1")
    })

    test('let expression', () => {
        assert.that(parseExpression("let x = y. z").toString()).
            isEqualTo("let x = y. z")
    })

    test('number literals', () => {
        assert.that(parseExpression("3").toString()).
            isEqualTo("3")
    })

    test('numbers', () => {
        assert.that(parseExpression("(λf.λx.x)").toString()).isEqualTo('0')
        assert.that(parseExpression("(λf.λx.x)").asNumber()).isEqualTo(0)
        assert.that(parseExpression("(λf.(λx.x))").asNumber()).isEqualTo(0)
        assert.that(parseExpression("(λf.(λx.f x))").asNumber()).isEqualTo(1)
        assert.that(parseExpression("(λf.(λx.f (f x)))").asNumber()).isEqualTo(2)
        assert.that(parseExpression("(λx.x)").asNumber()).isEqualTo(1)
        assert.that(parseExpression("(λx.(λf.(λx.f x)))").asNumber() === undefined).isTrue()
    })
})