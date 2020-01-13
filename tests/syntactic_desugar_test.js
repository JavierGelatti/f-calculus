const { suite, test, assert } = require('@pmoo/testy')

const { variable, application, lambda, letExpression, hole, number } = require('../src/ast')

suite('syntatic unsugaring', () => {
    test('let expressions are transformed into applications', () => {
        const letExpr = letExpression(
            variable('x'),
            variable('y'),
            variable('z')
        )

        assert.that(letExpr.unsugar()).isEqualTo(
            application(
                lambda(variable('x'), variable('z')),
                variable('y')
            )
        )
    })

    test('can unsugar zero', () => {
        assert.that(number(0).unsugar()).isEqualTo(
            lambda(variable('f'),
                lambda(variable('x'), variable('x'))
            )
        )
    })

    test('can unsugar integers greater than zero', () => {
        assert.that(number(2).unsugar()).isEqualTo(
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
            assert.that(astNode.unsugar()).isEqualTo(astNode)
        }
    })
})
