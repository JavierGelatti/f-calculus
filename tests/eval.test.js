const { variable, application, infixApplication, lambda, letExpression, number, primitive } = require('../src/ast')

describe('Beta reduction', () => {
    test('beta reduction of a variable is the variable', () => {
        expect(variable('x').betaReduced()).
            toEqual(variable('x'))
    })

    test('beta reduction of an abstraction is the abstraction', () => {
        let abstraction = lambda(variable('x'), variable('x'))

        expect(abstraction.betaReduced()).
            toEqual(abstraction)
    })

    test('application without replacing', () => {
        let abstraction = lambda(variable('x'), variable('z'))
        let argument = variable('y')

        expect(apply(abstraction, argument)).toEqual(variable('z'))
    })

    test('application replacing a variable', () => {
        let abstraction = lambda(variable('x'), variable('x'))
        let argument = variable('y')

        expect(apply(abstraction, argument)).toEqual(argument)
    })

    test('application replacing a free variable inside a lambda', () => {
        let abstraction = lambda(variable('x'), lambda(variable('y'), variable('x')))
        let argument = variable('z')

        expect(apply(abstraction, argument)).toEqual(lambda(variable('y'), variable('z')))
    })

    test('application not replacing a bound variable inside a lambda', () => {
        let abstraction = lambda(variable('x'), lambda(variable('x'), variable('x')))
        let argument = variable('z')

        expect(apply(abstraction, argument)).toEqual(lambda(variable('x'), variable('x')))
    })

    test('application not replacing variables on an application', () => {
        let abstraction = lambda(variable('x'), application(variable('x'), variable('x')))

        expect(apply(abstraction, variable('y')).equals(application(variable('y'), variable('y')))).toEqual(true)
    })

    test('nested application on nested lambda', () => {
        let abstraction = lambda(variable('x'), lambda(variable('y'), variable('x')))

        expect(
            application(
                application(abstraction, variable('a')),
                variable('b')
            ).betaReduced().betaReduced().equals(
                variable('a')
            )
        ).toEqual(true)
    })

    test('application of free variables', () => {
        expect(
            application(
                variable('a'),
                variable('b')
            ).betaReduced().equals(
                application(
                    variable('a'),
                    variable('b')
                )
            )
        ).toEqual(true)
    })

    test('full beta reduce', () => {
        let abstraction = lambda(variable('x'), lambda(variable('y'), variable('y')))

        expect(
            application(
                application(abstraction, variable('a')),
                application(variable('p'), variable('q'))
            ).fullBetaReduce().equals(
                application(variable('p'), variable('q'))
            )
        ).toEqual(true)
    })

    test('free vs bound while reducing', () => {
        let abstraction = lambda(variable('x'), lambda(variable('y'), variable('x')))

        expect(
            application(
                application(abstraction, variable('y')),
                variable('z')
            ).fullBetaReduce().equals(
                variable('y')
            )
        ).toEqual(true)
    })

    test('alpha conversion ok', () => {
        let abstraction = lambda(variable('x'), variable('x'))

        expect(abstraction.alphaConvert('y').
            equals(lambda(variable('y'), variable('y')))).toEqual(true)
    })

    test('alpha conversion error', () => {
        let abstraction = lambda(variable('x'), variable('y'))

        expect(() => abstraction.alphaConvert('y')).toThrow(/The variable y is free in the body/)
    })

    test('let expressions', () => {
        const letExpr = letExpression(
            variable('x'),
            lambda(variable('y'), variable('y')),
            application(variable('x'), variable('z'))
        )

        expect(letExpr.fullBetaReduce()).toEqual(variable('z'))
    })

    test('nested let expressions bodies', () => {
        const letExpr = letExpression(
            variable('x'),
            variable('y'),
            letExpression(
                variable('x'),
                variable('z'),
                variable('x')
            )
        )

        expect(letExpr.fullBetaReduce()).toEqual(variable('z'))
    })

    test('nested let expressions values', () => {
        const letExpr = letExpression(
            variable('x'),
            letExpression(
                variable('u'),
                variable('v'),
                variable('w')
            ),
            variable('x')
        )

        expect(letExpr.fullBetaReduce()).toEqual(variable('w'))
    })

    test('numbers', () => {
        const expr = application(
            lambda(variable('x'),
                lambda(variable('y'), variable('x'))
            ),
            number(0)
        )
        expect(expr.fullBetaReduce()).toEqual(lambda(variable('y'), number(0)))
    })

    test('numbers reduction', () => {
        expect(number(1).fullBetaReduce()).toEqual(number(1))
    })

    test('infix operators', () => {
        const expr = letExpression(
            variable('+'),
            lambda(variable('y'), lambda(variable('x'), variable('y'))),
            infixApplication(variable('+'), variable('v'), variable('w'))
        )
        expect(expr.fullBetaReduce()).toEqual(variable('v'))
    })

    test('js function evaluation', () => {
        let valuePassedToJs
        const expr = application(
            primitive(x => {
                valuePassedToJs = x
                return variable('y')
            }),
            variable('x')
        )

        const result = expr.fullBetaReduce()

        expect(valuePassedToJs).toEqual(variable('x'))
        expect(result).toEqual(variable('y'))
    })

    function apply(abstraction, argument) {
        return application(abstraction, argument).betaReduced()
    }
})
