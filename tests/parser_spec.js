const { suite, test, assert } = require('@pmoo/testy')
const { variable, application, lambda, letExpression , number } = require('../src/ast')
const { parseExpression } = require('../src/parser')

suite('Parser', () => {
    test('variables', () => {
        assert.that(parseExpression("asd")).isEqualTo(variable("asd"))
    })

    test('variables with numbers', () => {
        assert.that(parseExpression("asd123")).isEqualTo(variable("asd123"))
    })

    test('lambdas', () => {
        assert.that(parseExpression("λx.x")).isEqualTo(lambda(variable("x"), variable("x")))
    })

    test('lambdas with spaces', () => {
        assert.that(parseExpression("λx . x")).isEqualTo(lambda(variable("x"), variable("x")))
    })

    test('application', () => {
        assert.that(parseExpression("x y")).isEqualTo(application(variable("x"), variable("y")))
    })

    test('application with whitespace', () => {
        assert.that(parseExpression("x\n  y\n  z")).isEqualTo(
            application(
                application(variable("x"), variable("y")),
                variable("z")
            )
        )
    })

    test('application inside lambda', () => {
        assert.that(parseExpression("λx.x x")).isEqualTo(lambda(variable("x"), application(variable("x"), variable("x"))))
    })

    test('nested lambdas', () => {
        assert.that(parseExpression("λx.λy.x")).
            isEqualTo(lambda(variable("x"), lambda(variable("y"), variable("x"))))
    })

    test('nested application', () => {
        assert.that(parseExpression("x y z")).
            isEqualTo(application(application(variable("x"), variable("y")), variable("z")))
    })

    test('parentheses in application function', () => {
        assert.that(parseExpression("(λx.x) y")).
            isEqualTo(application(lambda(variable("x"), variable("x")), variable("y")))
    })

    test('parentheses in application argument', () => {
        assert.that(parseExpression("(λx.x) (y)")).
            isEqualTo(application(lambda(variable("x"), variable("x")), variable("y")))
    })

    test('parentheses in variables', () => {
        assert.that(parseExpression("(x)")).
            isEqualTo(variable("x"))
    })

    test('nested parentheses', () => {
        assert.that(parseExpression("((λx.((x))))")).
            isEqualTo(lambda(variable("x"), variable("x")))
    })

    test('parses let expressions', () => {
        assert.that(parseExpression("let x = y. x")).
        isEqualTo(
            letExpression(
                variable("x"),
                variable("y"),
                variable("x")
            )
        )
    })

    test('ignores whitespace in let expressions', () => {
        assert.that(parseExpression("let  x  =  y  .   \n\nx")).
            isEqualTo(
                letExpression(
                    variable("x"),
                    variable("y"),
                    variable("x")
                )
            )
    })

    test('number literals', () => {
        assert.that(parseExpression("12")).
        isEqualTo(
            number(12)
        )
    })

    test('number literals in applications', () => {
        assert.that(parseExpression("1 2 3")).
        isEqualTo(
            application(
                application(number(1), number(2)),
                number(3)
            )
        )
    })
})