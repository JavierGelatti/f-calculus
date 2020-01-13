const { suite, test, assert } = require('@pmoo/testy')
const { variable, application, infixApplication, lambda, letExpression, number } = require('../src/ast')
const { parseExpression } = require('../src/parser')

suite('Parser', () => {
    test('variables', () => {
        assert.that(parseExpression('asd')).isEqualTo(variable('asd'))
    })

    test('variables with numbers', () => {
        assert.that(parseExpression('asd123')).isEqualTo(variable('asd123'))
    })

    test('lambdas', () => {
        assert.that(parseExpression('λx.x')).isEqualTo(lambda(variable('x'), variable('x')))
    })

    test('lambdas with spaces', () => {
        assert.that(parseExpression('λx . x')).isEqualTo(lambda(variable('x'), variable('x')))
    })

    test('application', () => {
        assert.that(parseExpression('x y')).isEqualTo(application(variable('x'), variable('y')))
    })

    test('application with whitespace in between', () => {
        assert.that(parseExpression('x\n  y\n  z')).isEqualTo(
            application(
                application(variable('x'), variable('y')),
                variable('z')
            )
        )
    })

    test('application with whitespace at the end', () => {
        assert.that(parseExpression('f x ')).isEqualTo(
            application(
                variable('f'),
                variable('x')
            )
        )
    })

    test('application inside lambda', () => {
        assert.that(parseExpression('λx.x x')).isEqualTo(lambda(variable('x'), application(variable('x'), variable('x'))))
    })

    test('nested lambdas', () => {
        assert.that(parseExpression('λx.λy.x')).
            isEqualTo(lambda(variable('x'), lambda(variable('y'), variable('x'))))
    })

    test('nested application', () => {
        assert.that(parseExpression('x y z')).
            isEqualTo(application(application(variable('x'), variable('y')), variable('z')))
    })

    test('parentheses in application function', () => {
        assert.that(parseExpression('(λx.x) y')).
            isEqualTo(application(lambda(variable('x'), variable('x')), variable('y')))
    })

    test('parentheses in application argument', () => {
        assert.that(parseExpression('(λx.x) (y)')).
            isEqualTo(application(lambda(variable('x'), variable('x')), variable('y')))
    })

    test('parentheses in variables', () => {
        assert.that(parseExpression('(x)')).
            isEqualTo(variable('x'))
    })

    test('nested parentheses', () => {
        assert.that(parseExpression('((λx.((x))))')).
            isEqualTo(lambda(variable('x'), variable('x')))
    })

    test('let expressions', () => {
        assert.that(parseExpression('let x = y. x')).
            isEqualTo(
                letExpression(
                    variable('x'),
                    variable('y'),
                    variable('x')
                )
            )
    })

    test('let expressions with whitespace', () => {
        assert.that(parseExpression('let  x  =  y  .   \n\nx')).
            isEqualTo(
                letExpression(
                    variable('x'),
                    variable('y'),
                    variable('x')
                )
            )
    })

    test('number literals', () => {
        assert.that(parseExpression('12')).
            isEqualTo(
                number(12)
            )
    })

    test('number literals in applications', () => {
        assert.that(parseExpression('1 2 3')).
            isEqualTo(
                application(
                    application(number(1), number(2)),
                    number(3)
                )
            )
    })

    test('infix operators with numbers', () => {
        assert.that(parseExpression('1 + 2')).
            isEqualTo(
                infixApplication(
                    variable('+'),
                    number(1),
                    number(2)
                )
            )
    })

    test('infix operators with applications', () => {
        assert.that(parseExpression('f x + f y')).
            isEqualTo(
                infixApplication(
                    variable('+'),
                    application(variable('f'), variable('x')),
                    application(variable('f'), variable('y'))
                )
            )
    })

    test('infix operator as let variable', () => {
        assert.that(parseExpression('let + = x. +')).
            isEqualTo(
                letExpression(
                    variable('+'),
                    variable('x'),
                    variable('+'),
                )
            )
    })

    test('infix operator bound in abstraction', () => {
        assert.that(parseExpression('(λ+.+)')).
            isEqualTo(
                lambda(
                    variable('+'),
                    variable('+'),
                )
            )
    })

    test('chained infix operators', () => {
        assert.that(parseExpression('1 + 2 + 3')).
            isEqualTo(
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
        assert.that(parseExpression('f (+) 2')).
            isEqualTo(
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
        assert.that(parseExpression('(+) 2')).
            isEqualTo(
                application(
                    variable('+'),
                    number(2)
                )
            )
    })
})
