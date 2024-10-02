const { endOfInput, parse, digit, letter, char, choice, takeRight, recursiveParser, sequenceOf, many1, mapTo, pipeParsers, str, anyOfString, anyCharExcept, many, optionalWhitespace } = require('arcsecond')
const { identifier, lambda, application, infixApplication, hole, letExpression, number } = require('./ast')

const expressionParser = recursiveParser(() => pipeParsers([
    choice([letParser, infixApplicationParser, infixApplicationTermParser, infixOperatorParser])
]))

const invalidCharactersInIdentifiers = [anyOfString(' \n\t\r.\\λ()='), endOfInput]
const variableParser = pipeParsers([
    sequenceOf([
        optionalWhitespace,
        letter,
        many(anyCharExcept(choice(invalidCharactersInIdentifiers)))
    ]),
    mapTo(([_whitespace, startOfVariable, restOfVariable]) => identifier([startOfVariable, ...restOfVariable].join('')))
])

const infixOperatorCharacter = anyCharExcept(choice([...invalidCharactersInIdentifiers, digit, letter]))
const infixOperatorParser = pipeParsers([
    sequenceOf([
        takeRight(optionalWhitespace)(infixOperatorCharacter),
        many(infixOperatorCharacter)
    ]),
    mapTo(([startOfVariable, restOfVariable]) => identifier([startOfVariable, ...restOfVariable].join('')))
])

const numberParser = pipeParsers([
    takeRight(optionalWhitespace)(many1(digit)),
    mapTo(digits => number(parseInt(digits.join(''))))
])

const token = (string) => {
    return takeRight(optionalWhitespace)(string.length === 1 ? char(string) : str(string))
}

const identifierParser = choice([variableParser, infixOperatorParser])

const letParser = pipeParsers([
    sequenceOf([
        token('let'),
        identifierParser,
        token('='),
        expressionParser,
        token('.'),
        expressionParser
    ]),
    mapTo(([_letStr, variable, _equalsSign, value, _dot, expression]) => letExpression(variable, value, expression))
])

const lambdaParser = pipeParsers([
    sequenceOf([
        choice([token('λ'), token('\\')]),
        identifierParser,
        token('.'),
        expressionParser,
    ]),
    mapTo(([_lambdaChar, variable, _dot, body]) => lambda(variable, body))
])

const holeParser = pipeParsers([
    token('_'),
    mapTo(_underscore => hole())
])

const parenthesesParser = pipeParsers([
    sequenceOf([
        token('('),
        expressionParser,
        token(')'),
    ]),
    mapTo(([_openParen, expression, _closingParen]) => expression)
])

const applicationTermParser = choice([lambdaParser, variableParser, numberParser, parenthesesParser, holeParser])
const applicationParser = pipeParsers([
    sequenceOf([
        choice([applicationTermParser, infixOperatorParser]),
        many1(takeRight(optionalWhitespace)(applicationTermParser))
    ]),
    mapTo(([abstraction, args]) => {
        return args.reduce(
            (previousApplication, currentArgument) => application(previousApplication, currentArgument),
            abstraction
        )
    })
])

const infixApplicationTermParser = choice([applicationParser, applicationTermParser])
const infixApplicationParser = pipeParsers([
    sequenceOf([
        infixApplicationTermParser,
        many1(sequenceOf([infixOperatorParser, infixApplicationTermParser]))
    ]),
    mapTo(([firstArgument, rest]) => {
        return rest.reduce(
            (previousApplication, [currentOperator, currentSecondArgument]) =>
                infixApplication(currentOperator, previousApplication, currentSecondArgument),
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
