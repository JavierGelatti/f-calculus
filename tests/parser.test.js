const { variable, application, infixApplication, lambda, letExpression, number } = require('../src/ast')
const { parseExpression } = require('../src/parser')

describe('Parser', () => {
    test('variables', () => {
        expect(parseExpression('asd')).toEqual(variable('asd'))
    })

    test('variables with numbers', () => {
        expect(parseExpression('asd123')).toEqual(variable('asd123'))
    })

    test('lambdas', () => {
        expect(parseExpression('λx.x')).toEqual(lambda(variable('x'), variable('x')))
    })

    test('lambdas with spaces', () => {
        expect(parseExpression('λx . x')).toEqual(lambda(variable('x'), variable('x')))
    })

    test('application', () => {
        expect(parseExpression('x y')).toEqual(application(variable('x'), variable('y')))
    })

    test('application with whitespace in between', () => {
        expect(parseExpression('x\n  y\n  z')).toEqual(
            application(
                application(variable('x'), variable('y')),
                variable('z')
            )
        )
    })

    test('application with whitespace at the end', () => {
        expect(parseExpression('f x ')).toEqual(
            application(
                variable('f'),
                variable('x')
            )
        )
    })

    test('application inside lambda', () => {
        expect(parseExpression('λx.x x')).toEqual(lambda(variable('x'), application(variable('x'), variable('x'))))
    })

    test('nested lambdas', () => {
        expect(parseExpression('λx.λy.x')).
            toEqual(lambda(variable('x'), lambda(variable('y'), variable('x'))))
    })

    test('nested application', () => {
        expect(parseExpression('x y z')).
            toEqual(application(application(variable('x'), variable('y')), variable('z')))
    })

    test('parentheses in application function', () => {
        expect(parseExpression('(λx.x) y')).
            toEqual(application(lambda(variable('x'), variable('x')), variable('y')))
    })

    test('parentheses in application argument', () => {
        expect(parseExpression('(λx.x) (y)')).
            toEqual(application(lambda(variable('x'), variable('x')), variable('y')))
    })

    test('parentheses in variables', () => {
        expect(parseExpression('(x)')).
            toEqual(variable('x'))
    })

    test('nested parentheses', () => {
        expect(parseExpression('((λx.((x))))')).
            toEqual(lambda(variable('x'), variable('x')))
    })

    test('let expressions', () => {
        expect(parseExpression('let x = y. x')).
            toEqual(
                letExpression(
                    variable('x'),
                    variable('y'),
                    variable('x')
                )
            )
    })

    test('let expressions with whitespace', () => {
        expect(parseExpression('let  x  =  y  .   \n\nx')).
            toEqual(
                letExpression(
                    variable('x'),
                    variable('y'),
                    variable('x')
                )
            )
    })

    test('number literals', () => {
        expect(parseExpression('12')).
            toEqual(
                number(12)
            )
    })

    test('number literals in applications', () => {
        expect(parseExpression('1 2 3')).
            toEqual(
                application(
                    application(number(1), number(2)),
                    number(3)
                )
            )
    })

    test('infix operators with numbers', () => {
        expect(parseExpression('1 + 2')).
            toEqual(
                infixApplication(
                    variable('+'),
                    number(1),
                    number(2)
                )
            )
    })

    test('infix operators with applications', () => {
        expect(parseExpression('f x + f y')).
            toEqual(
                infixApplication(
                    variable('+'),
                    application(variable('f'), variable('x')),
                    application(variable('f'), variable('y'))
                )
            )
    })

    test('infix operator as let variable', () => {
        expect(parseExpression('let + = x. +')).
            toEqual(
                letExpression(
                    variable('+'),
                    variable('x'),
                    variable('+'),
                )
            )
    })

    test('infix operator bound in abstraction', () => {
        expect(parseExpression('(λ+.+)')).
            toEqual(
                lambda(
                    variable('+'),
                    variable('+'),
                )
            )
    })

    test('chained infix operators', () => {
        expect(parseExpression('1 + 2 + 3')).
            toEqual(
                infixApplication(
                    variable('+'),
                    infixApplication(
                        variable('+'),
                        number(1),
                        number(2)
                    ),
                    number(3)
                )
            )
    })

    test('infix operators as application arguments', () => {
        expect(parseExpression('f (+) 2')).
            toEqual(
                application(
                    application(
                        variable('f'),
                        variable('+')
                    ),
                    number(2)
                )
            )
    })

    test('infix operators as application functions', () => {
        expect(parseExpression('(+) 2')).
            toEqual(
                application(
                    variable('+'),
                    number(2)
                )
            )
    })

    test('infix operators as application functions without parenthesis', () => {
        expect(parseExpression('+ 2')).
            toEqual(
                application(
                    variable('+'),
                    number(2)
                )
            )
    })
})
