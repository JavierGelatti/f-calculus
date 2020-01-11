const { suite, test, assert } = require('@pmoo/testy')

const { variable, application, lambda, apply, letExpression, hole } = require('../src/ast')

suite('syntatic unsugaring', () => {
    test('let expressions are transformed into applications', () => {
        const letExpr = letExpression(
            variable("x"),
            variable("y"),
            variable("z")
        );

        assert.that(letExpr.unsugar()).isEqualTo(
            application(
                lambda(variable('x'), variable('z')),
                variable('y')
            )
        )
    })

    test('nested let expressions bodies are transformed into applications', () => {
        const letExpr = letExpression(
            variable("x"),
            variable("y"),
            letExpression(
                variable("u"),
                variable("v"),
                variable("w")
            )
        );

        assert.that(letExpr.unsugar()).isEqualTo(
            application(
                lambda(variable('x'),
                    application(
                        lambda(variable('u'), variable('w')),
                        variable('v')
                    )
                ),
                variable('y')
            )
        )
    })

    test('nested let expressions values are transformed into applications', () => {
        const letExpr = letExpression(
            variable("x"),
            letExpression(
                variable("u"),
                variable("v"),
                variable("w")
            ),
            variable("z")
        );

        assert.that(letExpr.unsugar()).isEqualTo(
            application(
                lambda(variable('x'), variable('z')),
                application(
                    lambda(variable('u'), variable('w')),
                    variable('v')
                )
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

        for (astNode of asts) {
            assert.that(astNode.unsugar()).isEqualTo(astNode);
        }
    })
})
