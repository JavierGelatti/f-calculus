const { variable, application, lambda, letExpression, hole, number } = require('../src/ast')

describe('syntatic unsugaring', () => {
    test('let expressions are transformed into applications', () => {
        const letExpr = letExpression(
            variable('x'),
            variable('y'),
            variable('z')
        )

        expect(letExpr.unsugar()).toEqual(
            application(
                lambda(variable('x'), variable('z')),
                variable('y')
            )
        )
    })

    test('can unsugar zero', () => {
        expect(number(0).unsugar()).toEqual(
            lambda(variable('f'),
                lambda(variable('x'), variable('x'))
            )
        )
    })

    test('can unsugar integers greater than zero', () => {
        expect(number(2).unsugar()).toEqual(
            lambda(variable('f'),
                lambda(variable('x'), application(variable('f'), application(variable('f'), variable('x'))))
            )
        )
    })

    test('non-syntactic-sugar nodes do not change', () => {
        const asts = [
            variable('x'),
            lambda(variable('x'), variable('y')),
            application(variable('x'), variable('y')),
            hole()
        ]

        for (const astNode of asts) {
            expect(astNode.unsugar()).toEqual(astNode)
        }
    })
})
