const { variable, application, lambda, number } = require('../src/ast')
const { asNumber, withPrimitiveBindings } = require('../src/primitives')

describe('Primitives', () => {
    
    test('zero asNumber', () => {
        const zero = lambda(variable('f'), lambda(variable('x'), variable('x')))

        expect(apply(asNumber, zero)).toEqual(number(0))
    })

    test('greater than zero asNumber', () => {
        const two = lambda(variable('f'), lambda(variable('x'),
            application(variable('f'), application(variable('f'), variable('x')))
        ))

        expect(apply(asNumber, two)).toEqual(number(2))
    })

    test('identity asNumber', () => {
        const id = lambda(variable('x'), variable('x'))

        expect(apply(asNumber, id)).toEqual(number(1))
    })

    test('not reduced number asNumber', () => {
        const two = lambda(variable('f'), lambda(variable('x'),
            application(variable('f'), application(variable('f'), variable('x')))
        ))
        const id = lambda(variable('x'), variable('x'))
        const value = application(id, two)

        expect(apply(asNumber, value)).toEqual(number(2))
    })

    test('not number asNumber', () => {
        const nan = lambda(variable('f'), lambda(variable('x'), variable('f')))

        expect(apply(asNumber, nan)).toEqual(nan)
    })

    test('add primitive bindings', () => {
        const result = withPrimitiveBindings(variable('asNumber')).fullBetaReduce()
        
        expect(result).toEqual(asNumber)
    })

        
    function apply(abstraction, argument) {
        return application(abstraction, argument).betaReduced()
    }
})