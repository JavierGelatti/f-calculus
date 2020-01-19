const { identifier, application, lambda, number, pair } = require('../src/ast')
const { asNumber, asPair, withPrimitiveBindings } = require('../src/primitives')

describe('Primitives', () => {
    describe('asNumber', () => {
        test('zero', () => {
            const zero = lambda(identifier('f'), lambda(identifier('x'), identifier('x')))

            expect(apply(asNumber, zero)).toEqual(number(0))
        })

        test('greater than zero', () => {
            const two = lambda(identifier('f'), lambda(identifier('x'),
                application(identifier('f'), application(identifier('f'), identifier('x')))
            ))

            expect(apply(asNumber, two)).toEqual(number(2))
        })

        test('identity', () => {
            const id = lambda(identifier('x'), identifier('x'))

            expect(apply(asNumber, id)).toEqual(number(1))
        })

        test('not reduced number', () => {
            const two = lambda(identifier('f'), lambda(identifier('x'),
                application(identifier('f'), application(identifier('f'), identifier('x')))
            ))
            const id = lambda(identifier('x'), identifier('x'))
            const value = application(id, two)

            expect(apply(asNumber, value)).toEqual(number(2))
        })

        test('not number', () => {
            const nan = lambda(identifier('f'), lambda(identifier('x'), identifier('f')))

            expect(apply(asNumber, nan)).toEqual(nan)
        })
    })

    describe('asPair', () => {
        test('manually-built pair', () => {
            const makePair = (first, second) => lambda(identifier('f'), application(application(identifier('f'), first), second))
            const aPair = makePair(number(1), number(2))

            expect(apply(asPair, aPair).toString()).
                toEqual('((((λfirst.(λsecond.first)) 1) 2), (((λfirst.(λsecond.second)) 1) 2))')
        })

        test('primitive pair', () => {
            const aPair = pair(number(1), number(2))

            expect(apply(asPair, aPair)).toEqual(aPair)
        })

        test('non-pair', () => {
            const nonPair = application(identifier('x'), identifier('y'))

            expect(apply(asPair, nonPair)).toEqual(nonPair)
        })
    })

    test('add primitive bindings', () => {
        const result = withPrimitiveBindings(identifier('asNumber')).fullBetaReduce()

        expect(result).toEqual(asNumber)
    })

    function apply(abstraction, firstArgument, ...args) {
        return args.reduce(
            application,
            application(abstraction, firstArgument)
        ).fullBetaReduce()
    }
})