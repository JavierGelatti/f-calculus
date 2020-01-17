const { primitive } = require('../src/ast')
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
})
