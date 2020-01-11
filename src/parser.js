const { endOfInput, parse, digit, letter, char, choice, recursiveParser, sequenceOf, many1, mapTo, pipeParsers, sepBy1, str, anyOfString, many } = require('arcsecond')
const { Variable, Abstraction, Application, Hole, LetExpression } = require('./ast')

const whitespace = anyOfString(' \n\t\r')
const maybeWhitespaces = many(whitespace).map(x => x.join(''))
const whitespaces = many1(whitespace).map(x => x.join(''))

const expressionParser = recursiveParser(() => pipeParsers([
    choice([letParser, applicationParser, lambdaParser, variableParser, parenthesesParser, holeParser])
]))

const variableParser = pipeParsers([
    sequenceOf([
        maybeWhitespaces,
        many1(choice([digit, letter]))
    ]),
    mapTo(([whitespace, variableName]) => new Variable(variableName.join('')))
])

const token = (string) => {
    return pipeParsers([
        sequenceOf([
            maybeWhitespaces,
            str(string)
        ]),
        mapTo(([whitespace, readString]) => readString)
    ])
}

const letParser = pipeParsers([
    sequenceOf([
        token('let'),
        variableParser,
        token('='),
        expressionParser,
        token('.'),
        expressionParser
    ]),
    mapTo(([letStr, variable, equals, value, dot, expression]) => new LetExpression(variable, value, expression))
])

const lambdaParser = pipeParsers([
    sequenceOf([
        maybeWhitespaces,
        char('λ'),
        variableParser,
        char('.'),
        expressionParser,
    ]),
    mapTo(([whitespace, lambda, variable, dot, body]) => new Abstraction(variable, body))
])

const holeParser = pipeParsers([
    sequenceOf([ maybeWhitespaces, char('_')]),
    mapTo(([whitespace, underscore]) => new Hole())
])

const parenthesesParser = pipeParsers([
    sequenceOf([
        maybeWhitespaces,
        char('('),
        expressionParser,
        maybeWhitespaces,
        char(')'),
    ]),
    mapTo(([whitespace0, openParen, expression, whitespace1, closingParen]) => expression)
])

const applicationParser = pipeParsers([
    sequenceOf([
        choice([lambdaParser, variableParser, parenthesesParser, holeParser]),
        sepBy1 (whitespaces) (choice([lambdaParser, variableParser, parenthesesParser, holeParser]))
    ]),
    mapTo(([abstraction, args]) => {
        const applications = [abstraction, ...args]
        return applications.reduce((previousApplication, currentArgument) => new Application(previousApplication, currentArgument))
    })
])

function parseExpression(text) {
    const completeExpression = pipeParsers([
        sequenceOf([
            expressionParser,
            endOfInput
        ]),
        mapTo(x => x[0])
    ])

    return parse(completeExpression)(text).value
}

module.exports = { parseExpression }
