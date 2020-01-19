const { primitive, application, lambda, variable, number } = require('../src/ast')
const { ',': makePair } = require('../src/primitives')
const { parseExpression } = require('../src/parser')

describe('string representation', () => {
    test('application', () => {
        expect(parseExpression('f x').toString()).
            toEqual('(f x)')
    })

    test('abstraction', () => {
        expect(parseExpression('(λx.x)').toString()).
            toEqual('(λx.x)')
    })

    test('let expression', () => {
        expect(parseExpression('let x = y. z').toString()).
            toEqual('let x = y. z')
    })

    test('number literals', () => {
        expect(parseExpression('3').toString()).
            toEqual('3')
    })

    test('infix operators', () => {
        expect(parseExpression('x + y').toString()).toEqual('x + y')
    })

    test('js values', () => {
        expect(primitive(x => x).toString()).toEqual('<primitive: x => x>')
        expect(primitive(x => x, 'stuff').toString()).toEqual('stuff')
    })

    test('pairs', () => {
        const id = lambda(variable('x'), variable('x'))

        expect(primitivePair(application(id, number(1)), number(2)).toString()).
            toEqual('(((λx.x) 1), 2)')
    })

    function primitivePair(first, second) {
        return apply(makePair, first, second)
    }

    function apply(abstraction, firstArgument, ...args) {
        return args.reduce(
            application,
            application(abstraction, firstArgument)
        ).fullBetaReduce()
    }
})
