const { suite, test, assert } = require('@pmoo/testy')

const { variable, application, lambda, apply, letExpression, number } = require('../src/ast')

suite('Beta reduction', () => {
    test('beta reduction of a variable is the variable', () => {
        assert.that(variable("x").betaReduced()).
            isEqualTo(variable("x"))
    })

    test('beta reduction of an abstraction is the abstraction', () => {
        let abstraction = lambda(variable("x"), variable("x"))

        assert.that(abstraction.betaReduced()).
            isEqualTo(abstraction)
    })

    test('application without replacing', () => {
        let abstraction = lambda(variable("x"), variable("z"))
        let argument = variable("y")

        assert.that(apply(abstraction, argument)).isEqualTo(variable("z"))
    })

    test('application replacing a variable', () => {
        let abstraction = lambda(variable("x"), variable("x"))
        let argument = variable("y")

        assert.that(apply(abstraction, argument)).isEqualTo(argument)
    })

    test('application replacing a free variable inside a lambda', () => {
        let abstraction = lambda(variable("x"), lambda(variable("y"), variable("x")))
        let argument = variable("z")

        assert.that(apply(abstraction, argument)).isEqualTo(lambda(variable("y"), variable("z")))
    })

    test('application not replacing a bound variable inside a lambda', () => {
        let abstraction = lambda(variable("x"), lambda(variable("x"), variable("x")))
        let argument = variable("z")

        assert.that(apply(abstraction, argument)).isEqualTo(lambda(variable("x"), variable("x")))
    })

    test('application not replacing variables on an application', () => {
        let abstraction = lambda(variable("x"), application(variable("x"), variable("x")))

        assert.isTrue(apply(abstraction, variable("y")).equals(application(variable("y"), variable("y"))))
    })

    test('nested application on nested lambda', () => {
        let abstraction = lambda(variable("x"), lambda(variable("y"), variable("x")))

        assert.isTrue(
            application(
                application(abstraction, variable("a")),
                variable("b")
            ).betaReduced().betaReduced().equals(
                variable("a")
            )
        )
    })

    test('application of free variables', () => {
        assert.isTrue(
            application(
                variable("a"),
                variable("b")
            ).betaReduced().equals(
                application(
                    variable("a"),
                    variable("b")
                )
            )
        )
    })

    test('full beta reduce', () => {
        let abstraction = lambda(variable("x"), lambda(variable("y"), variable("y")))

        assert.isTrue(
            application(
                application(abstraction, variable("a")),
                application(variable("p"), variable("q"))
            ).fullBetaReduce().equals(
                application(variable("p"), variable("q"))
            )
        )
    })

    test('free vs bound while reducing', () => {
        let abstraction = lambda(variable("x"), lambda(variable("y"), variable("x")))

        assert.isTrue(
            application(
                application(abstraction, variable("y")),
                variable("z")
            ).fullBetaReduce().equals(
                variable("y")
            )
        )
    })

    test('alpha conversion ok', () => {
        let abstraction = lambda(variable("x"), variable("x"))

        assert.isTrue(abstraction.alphaConvert("y").
            equals(lambda(variable("y"), variable("y"))))
    })

    test('alpha conversion error', () => {
        let abstraction = lambda(variable("x"), variable("y"))

        assert.that(() => abstraction.alphaConvert("y")).raises(/The variable y is free in the body/)
    })

    test('let expressions', () => {
        const letExpr = letExpression(
            variable("x"),
            lambda(variable("y"), variable("y")),
            application(variable("x"), variable("z"))
        )

        assert.that(letExpr.fullBetaReduce()).isEqualTo(variable("z"))
    })

    test('numbers', () => {
        const expr = application(
            lambda(variable("x"),
                lambda(variable("y"), variable("x"))
            ),
            number(0)
        )
        assert.that(expr.fullBetaReduce()).isEqualTo(lambda(variable('y'), number(0)))
    })
})