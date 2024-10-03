import { application, hole, identifier, lambda, letExpression, number } from '../src/ast.js'

describe('syntatic unsugaring', () => {
    test('let expressions are transformed into applications', () => {
        const letExpr = letExpression(
            identifier('x'),
            identifier('y'),
            identifier('z')
        )

        expect(letExpr.unsugar()).toEqual(
            application(
                lambda(identifier('x'), identifier('z')),
                identifier('y')
            )
        )
    })

    test('can unsugar zero', () => {
        expect(number(0).unsugar()).toEqual(
            lambda(identifier('f'),
                lambda(identifier('x'), identifier('x'))
            )
        )
    })

    test('can unsugar integers greater than zero', () => {
        expect(number(2).unsugar()).toEqual(
            lambda(identifier('f'),
                lambda(identifier('x'), application(identifier('f'), application(identifier('f'), identifier('x'))))
            )
        )
    })

    test('non-syntactic-sugar nodes do not change', () => {
        const asts = [
            identifier('x'),
            lambda(identifier('x'), identifier('y')),
            application(identifier('x'), identifier('y')),
            hole()
        ]

        for (const astNode of asts) {
            expect(astNode.unsugar()).toEqual(astNode)
        }
    })
})
