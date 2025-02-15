import { application, identifier, infixApplication, lambda, letExpression, number, pair, primitive } from '../src/ast.js'
import { namedExpression } from '../src/named_expression.js'


describe('Beta reduction', () => {
    test('beta reduction of a variable is the variable', () => {
        expect(identifier('x').betaReduced()).
            toEqual(identifier('x'))
    })

    test('beta reduction of an abstraction is the abstraction', () => {
        let abstraction = lambda(identifier('x'), identifier('x'))

        expect(abstraction.betaReduced()).
            toEqual(abstraction)
    })

    test('application without replacing', () => {
        let abstraction = lambda(identifier('x'), identifier('z'))
        let argument = identifier('y')

        expect(apply(abstraction, argument)).toEqual(identifier('z'))
    })

    test('application replacing a variable', () => {
        let abstraction = lambda(identifier('x'), identifier('x'))
        let argument = identifier('y')

        expect(apply(abstraction, argument)).toEqual(argument)
    })

    test('application replacing a free variable inside a lambda', () => {
        let abstraction = lambda(identifier('x'), lambda(identifier('y'), identifier('x')))
        let argument = identifier('z')

        expect(apply(abstraction, argument)).toEqual(lambda(identifier('y'), identifier('z')))
    })

    test('application not replacing a bound variable inside a lambda', () => {
        let abstraction = lambda(identifier('x'), lambda(identifier('x'), identifier('x')))
        let argument = identifier('z')

        expect(apply(abstraction, argument)).toEqual(lambda(identifier('x'), identifier('x')))
    })

    test('application not replacing variables on an application', () => {
        let abstraction = lambda(identifier('x'), application(identifier('x'), identifier('x')))

        expect(apply(abstraction, identifier('y')).equals(application(identifier('y'), identifier('y')))).toEqual(true)
    })

    test('nested application on nested lambda', () => {
        let abstraction = lambda(identifier('x'), lambda(identifier('y'), identifier('x')))

        expect(
            application(
                application(abstraction, identifier('a')),
                identifier('b')
            ).betaReduced().betaReduced().equals(
                identifier('a')
            )
        ).toEqual(true)
    })

    test('application of free variables', () => {
        expect(
            application(
                identifier('a'),
                identifier('b')
            ).betaReduced().equals(
                application(
                    identifier('a'),
                    identifier('b')
                )
            )
        ).toEqual(true)
    })

    test('full beta reduce', () => {
        let abstraction = lambda(identifier('x'), lambda(identifier('y'), identifier('y')))

        expect(
            application(
                application(abstraction, identifier('a')),
                application(identifier('p'), identifier('q'))
            ).fullBetaReduce().equals(
                application(identifier('p'), identifier('q'))
            )
        ).toEqual(true)
    })

    test('free vs bound while reducing', () => {
        let abstraction = lambda(identifier('x'), lambda(identifier('y'), identifier('x')))

        expect(
            application(
                application(abstraction, identifier('y')),
                identifier('z')
            ).fullBetaReduce().equals(
                identifier('y')
            )
        ).toEqual(true)
    })

    test('auto alpha-converts to avoid unwanted captures (free vs bound while reducing round 2?)', () => {
        let abstraction = lambda(identifier('x'), lambda(identifier('y'),
            application(identifier('x'), application(identifier('y'), identifier('a')))))

        expect(
            application(
                application(abstraction, identifier('y')),
                identifier('z')
            ).fullBetaReduce().equals(
                application(identifier('y'), application(identifier('z'), identifier('a'))),
                identifier('y')
            )
        ).toEqual(true)
    })

    test('alpha conversion ok', () => {
        let abstraction = lambda(identifier('x'), identifier('x'))

        expect(abstraction.alphaConvert('y').
            equals(lambda(identifier('y'), identifier('y')))).toEqual(true)
    })

    test('alpha conversion error', () => {
        let abstraction = lambda(identifier('x'), identifier('y'))

        expect(() => abstraction.alphaConvert('y')).toThrow(/The variable y is free in the body/)
    })

    test('let expressions', () => {
        const letExpr = letExpression(
            identifier('x'),
            lambda(identifier('y'), identifier('y')),
            application(identifier('x'), identifier('z'))
        )

        expect(letExpr.fullBetaReduce()).toEqual(identifier('z'))
    })

    test('nested let expressions bodies', () => {
        const letExpr = letExpression(
            identifier('x'),
            identifier('y'),
            letExpression(
                identifier('x'),
                identifier('z'),
                identifier('x')
            )
        )

        expect(letExpr.fullBetaReduce()).toEqual(identifier('z'))
    })

    test('nested let expressions values', () => {
        const letExpr = letExpression(
            identifier('x'),
            letExpression(
                identifier('u'),
                identifier('v'),
                identifier('w')
            ),
            identifier('x')
        )

        expect(letExpr.fullBetaReduce()).toEqual(identifier('w'))
    })

    test('numbers', () => {
        const expr = application(
            lambda(identifier('x'),
                lambda(identifier('y'), identifier('x'))
            ),
            number(0)
        )
        expect(expr.fullBetaReduce()).toEqual(lambda(identifier('y'), number(0)))
    })

    test('numbers reduction', () => {
        expect(number(1).fullBetaReduce()).toEqual(number(1))
    })

    test('infix operators', () => {
        const expr = letExpression(
            identifier('+'),
            lambda(identifier('y'), lambda(identifier('x'), identifier('y'))),
            infixApplication(identifier('+'), identifier('v'), identifier('w'))
        )
        expect(expr.fullBetaReduce()).toEqual(identifier('v'))
    })

    test('js function evaluation', () => {
        let valuePassedToJs
        const expr = application(
            primitive(x => {
                valuePassedToJs = x
                return identifier('y')
            }),
            identifier('x')
        )

        const result = expr.fullBetaReduce()

        expect(valuePassedToJs).toEqual(identifier('x'))
        expect(result).toEqual(identifier('y'))
    })

    test('getting first of pairs', () => {
        const expr = application(
            pair(number(1), number(2)),
            lambda(identifier('x'), lambda(identifier('y'), identifier('x')))
        )

        expect(expr.fullBetaReduce()).toEqual(number(1))
    })

    test('getting second of pairs', () => {
        const expr = application(
            pair(number(1), number(2)),
            lambda(identifier('x'), lambda(identifier('y'), identifier('y')))
        )

        expect(expr.fullBetaReduce()).toEqual(number(2))
    })

    test('named expressions reduce to themselves if the inner expression reduces to itself', () => {
        const namedExpr = namedExpression(
            'y', identifier('x')
        )

        expect(namedExpr.fullBetaReduce()).toEqual(namedExpr)
    })

    test('named expressions reduce to its inner expression if it does not reduce to itself', () => {
        const id = lambda(identifier('x'), identifier('x'))
        const namedExpr = namedExpression(
            'y',
            application(id, id)
        )

        expect(namedExpr.fullBetaReduce()).toEqual(id)
    })

    test('named expressions behave like its inner expression', () => {
        const constZ = lambda(identifier('x'), identifier('z'))
        const namedExpr = namedExpression('y', constZ)

        expect(namedExpr.freeVariables()).toEqual([identifier('z')])
        expect(namedExpr.applyTo(identifier('w'))).toEqual(identifier('z'))
        expect(namedExpr.replaceFreeVariable(identifier('z'), identifier('w')))
            .toEqual(lambda(identifier('x'), identifier('w')))
    })

    function apply(abstraction, firstArgument, ...args) {
        return args.reduce(
            application,
            application(abstraction, firstArgument)
        ).fullBetaReduce()
    }
})
