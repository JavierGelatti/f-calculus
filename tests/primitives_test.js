const { suite, test, assert } = require('@pmoo/testy')
const { variable, application, lambda, number } = require('../src/ast')
const { asNumber, withPrimitiveBindings } = require('../src/primitives')

suite('Primitives', () => {
    
    test('zero asNumber', () => {
        const zero = lambda(variable('f'), lambda(variable('x'), variable('x')))

        assert.that(apply(asNumber, zero)).isEqualTo(number(0))
    })

    test('greater than zero asNumber', () => {
        const two = lambda(variable('f'), lambda(variable('x'),
            application(variable('f'), application(variable('f'), variable('x')))
        ))

        assert.that(apply(asNumber, two)).isEqualTo(number(2))
    })

    test('identity asNumber', () => {
        const id = lambda(variable('x'), variable('x'))

        assert.that(apply(asNumber, id)).isEqualTo(number(1))
    })

    test('not reduced number asNumber', () => {
        const two = lambda(variable('f'), lambda(variable('x'),
            application(variable('f'), application(variable('f'), variable('x')))
        ))
        const id = lambda(variable('x'), variable('x'))
        const value = application(id, two)

        assert.that(apply(asNumber, value)).isEqualTo(number(2))
    })

    test('not number asNumber', () => {
        const nan = lambda(variable('f'), lambda(variable('x'), variable('f')))

        assert.that(apply(asNumber, nan)).isEqualTo(nan)
    })

    test('add primitive bindings', () => {
        const result = withPrimitiveBindings(variable('asNumber')).fullBetaReduce()
        
        assert.that(result).isEqualTo(asNumber)
    })

        
    function apply(abstraction, argument) {
        return application(abstraction, argument).betaReduced()
    }
})