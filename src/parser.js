const { endOfInput, parse, digit, letter, char, choice, takeRight, recursiveParser, lookAhead, sequenceOf, many1, mapTo, pipeParsers, sepBy1, str, anyOfString, anythingExcept, many, whitespace, optionalWhitespace } = require('arcsecond')
const { Variable, Abstraction, Application, InfixApplication, Hole, LetExpression, NumberLiteral } = require('./ast')

const expressionParser = recursiveParser(() => pipeParsers([
    choice([letParser, infixApplicationParser, applicationParser, lambdaParser, variableParser, numberParser, parenthesesParser, holeParser, infixOperatorParser])
]))

const invalidCharactersInIdentifiers = [anyOfString(' \n\t\r.\\λ()='), endOfInput];
const variableParser = pipeParsers([
    sequenceOf([
        optionalWhitespace,
        letter,
        many(anythingExcept(choice(invalidCharactersInIdentifiers)))
    ]),
    mapTo(([whitespace, startOfVariable, restOfVariable]) => new Variable([startOfVariable, ...restOfVariable].join('')))
])

const infixOperatorParser = pipeParsers([
    sequenceOf([
        optionalWhitespace,
        anythingExcept(choice([...invalidCharactersInIdentifiers, digit, letter])),
        many(anythingExcept(choice([...invalidCharactersInIdentifiers, digit, letter])))
    ]),
    mapTo(([whitespace, startOfVariable, restOfVariable]) => new Variable([startOfVariable, ...restOfVariable].join('')))
])

const fullVariableParser = choice([variableParser, infixOperatorParser])

const numberParser = pipeParsers([
    sequenceOf([
        optionalWhitespace,
        many1(digit)
    ]),
    mapTo(([whitespace, value]) => new NumberLiteral(parseInt(value.join(''))))
])

const token = (string) => {
    return pipeParsers([
        sequenceOf([
            optionalWhitespace,
            str(string)
        ]),
        mapTo(([whitespace, readString]) => readString)
    ])
}

const letParser = pipeParsers([
    sequenceOf([
        token('let'),
        fullVariableParser,
        token('='),
        expressionParser,
        token('.'),
        expressionParser
    ]),
    mapTo(([letStr, variable, equals, value, dot, expression]) => new LetExpression(variable, value, expression))
])

const lambdaParser = pipeParsers([
    sequenceOf([
        optionalWhitespace,
        anyOfString('λ\\'),
        fullVariableParser,
        token('.'),
        expressionParser,
    ]),
    mapTo(([whitespace, lambda, variable, dot, body]) => new Abstraction(variable, body))
])

const holeParser = pipeParsers([
    sequenceOf([optionalWhitespace, char('_')]),
    mapTo(([whitespace, underscore]) => new Hole())
])

const parenthesesParser = pipeParsers([
    sequenceOf([
        optionalWhitespace,
        char('('),
        expressionParser,
        optionalWhitespace,
        char(')'),
    ]),
    mapTo(([whitespace0, openParen, expression, whitespace1, closingParen]) => expression)
])

const applicationParser = pipeParsers([
    sequenceOf([
        choice([lambdaParser, variableParser, numberParser, parenthesesParser, holeParser]),
        sepBy1(
            sequenceOf([whitespace, lookAhead(choice([lambdaParser, variableParser, numberParser, parenthesesParser, holeParser]))])
        )(choice([lambdaParser, variableParser, numberParser, parenthesesParser, holeParser]))
    ]),
    mapTo(([abstraction, args]) => {
        return args.reduce(
            (previousApplication, currentArgument) => new Application(previousApplication, currentArgument),
            abstraction
        )
    })
])

const infixApplicationParser = pipeParsers([
    sequenceOf([
        choice([applicationParser, lambdaParser, variableParser, numberParser, parenthesesParser, holeParser]),
        many1(sequenceOf([
            takeRight(optionalWhitespace)(infixOperatorParser),
            choice([applicationParser, lambdaParser, variableParser, numberParser, parenthesesParser, holeParser]),
        ]))
    ]),
    mapTo(([firstArgument, rest]) => {
        return rest.reduce(
            (previousApplication, [currentOperator, currentSecondArgument]) =>
                new InfixApplication(currentOperator, previousApplication, currentSecondArgument),
            firstArgument
        )
    })
])

function parseExpression(text) {
    const completeExpression = pipeParsers([
        sequenceOf([
            expressionParser,
            optionalWhitespace,
            endOfInput
        ]),
        mapTo(x => x[0])
    ])

    const parseResult = parse(completeExpression)(text)
    if (parseResult.isError) {
        throw new Error(parseResult.error)
    }

    return parseResult.result
}

module.exports = { parseExpression }
