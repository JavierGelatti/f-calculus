import { application, identifier, lambda, number, primitive } from '../src/ast.js'
import { parseExpression } from '../src/parser.js'
import { asNumber, makePair } from '../src/primitives.js'
import { namedExpression } from '../src/named_expression.js'

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

    test('named expressions', () => {
        expect(
            namedExpression('y', identifier('x')).toString()
        ).toEqual('y')
    })

    test('pairs', () => {
        const id = lambda(identifier('x'), identifier('x'))

        expect(primitivePair(application(id, number(1)), number(2)).toString()).
            toEqual('(((λx.x) 1), 2)')
    })

    test('primitives', () => {
        expect(asNumber.toString()).
            toEqual('<primitive: asNumber>')
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
