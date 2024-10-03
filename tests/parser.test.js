import { parseExpression } from '../src/parser.js'
import { application, identifier, infixApplication, lambda, letExpression, number } from '../src/ast.js'

describe('Parser', () => {
    test('variables', () => {
        expect(parseExpression('asd')).toEqual(identifier('asd'))
    })

    test('variables with numbers', () => {
        expect(parseExpression('asd123')).toEqual(identifier('asd123'))
    })

    test('lambdas', () => {
        expect(parseExpression('λx.x')).toEqual(lambda(identifier('x'), identifier('x')))
    })

    test('lambdas with spaces', () => {
        expect(parseExpression('λx . x')).toEqual(lambda(identifier('x'), identifier('x')))
    })

    test('application', () => {
        expect(parseExpression('x y')).toEqual(application(identifier('x'), identifier('y')))
    })

    test('application with whitespace in between', () => {
        expect(parseExpression('x\n  y\n  z')).toEqual(
            application(
                application(identifier('x'), identifier('y')),
                identifier('z')
            )
        )
    })

    test('application with whitespace at the end', () => {
        expect(parseExpression('f x ')).toEqual(
            application(
                identifier('f'),
                identifier('x')
            )
        )
    })

    test('application with redundant parentheses', () => {
        expect(parseExpression('f(x)')).toEqual(
            application(
                identifier('f'),
                identifier('x')
            )
        )
    })

    test('application chain with redundant parentheses', () => {
        expect(parseExpression('f(x)(y)')).toEqual(
            application(
                application(
                    identifier('f'),
                    identifier('x')
                ),
                identifier('y')
            )
        )
    })

    test('application inside lambda', () => {
        expect(parseExpression('λx.x x')).toEqual(lambda(identifier('x'), application(identifier('x'), identifier('x'))))
    })

    test('nested lambdas', () => {
        expect(parseExpression('λx.λy.x')).
            toEqual(lambda(identifier('x'), lambda(identifier('y'), identifier('x'))))
    })

    test('nested application', () => {
        expect(parseExpression('x y z')).
            toEqual(application(application(identifier('x'), identifier('y')), identifier('z')))
    })

    test('parentheses in application function', () => {
        expect(parseExpression('(λx.x) y')).
            toEqual(application(lambda(identifier('x'), identifier('x')), identifier('y')))
    })

    test('parentheses in application argument', () => {
        expect(parseExpression('(λx.x) (y)')).
            toEqual(application(lambda(identifier('x'), identifier('x')), identifier('y')))
    })

    test('parentheses in variables', () => {
        expect(parseExpression('(x)')).
            toEqual(identifier('x'))
    })

    test('nested parentheses', () => {
        expect(parseExpression('((λx.((x))))')).
            toEqual(lambda(identifier('x'), identifier('x')))
    })

    test('let expressions', () => {
        expect(parseExpression('let x = y. x')).
            toEqual(
                letExpression(
                    identifier('x'),
                    identifier('y'),
                    identifier('x')
                )
            )
    })

    test('let expressions with whitespace', () => {
        expect(parseExpression('let  x  =  y  .   \n\nx')).
            toEqual(
                letExpression(
                    identifier('x'),
                    identifier('y'),
                    identifier('x')
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
                    identifier('+'),
                    number(1),
                    number(2)
                )
            )
    })

    test('infix operators with applications', () => {
        expect(parseExpression('f x + f y')).
            toEqual(
                infixApplication(
                    identifier('+'),
                    application(identifier('f'), identifier('x')),
                    application(identifier('f'), identifier('y'))
                )
            )
    })

    test('infix operator as let variable', () => {
        expect(parseExpression('let + = x. +')).
            toEqual(
                letExpression(
                    identifier('+'),
                    identifier('x'),
                    identifier('+'),
                )
            )
    })

    test('infix operator bound in abstraction', () => {
        expect(parseExpression('(λ+.+)')).
            toEqual(
                lambda(
                    identifier('+'),
                    identifier('+'),
                )
            )
    })

    test('chained infix operators', () => {
        expect(parseExpression('1 + 2 + 3')).
            toEqual(
                infixApplication(
                    identifier('+'),
                    infixApplication(
                        identifier('+'),
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
                        identifier('f'),
                        identifier('+')
                    ),
                    number(2)
                )
            )
    })

    test('infix operators as application functions', () => {
        expect(parseExpression('(+) 2')).
            toEqual(
                application(
                    identifier('+'),
                    number(2)
                )
            )
    })

    test('infix operators as application functions without parenthesis', () => {
        expect(parseExpression('+ 2')).
            toEqual(
                application(
                    identifier('+'),
                    number(2)
                )
            )
    })
})
