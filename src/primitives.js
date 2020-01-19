const { primitive, application, number, letExpression, identifier, lambda, pair } = require('./ast')

const asNumber = primitive(anExpression => {
    if (anExpression.constructor.name !== 'Abstraction') {
        return anExpression
    }

    const plusOne = primitive(anArgument => {
        const reducedArgument = anArgument.fullBetaReduce()

        if (reducedArgument.isPrimitive()) {
            return primitive(reducedArgument.value + 1)
        } else {
            // Couldn't apply
            return application(plusOne, reducedArgument)
        }
    })

    const value = application(
        application(anExpression, plusOne),
        primitive(0)
    ).fullBetaReduce().value

    if (typeof value === 'number') {
        return number(value)
    } else {
        return anExpression
    }
})

const makePair = lambda(identifier('first'), lambda(identifier('second'), pair(identifier('first'), identifier('second'))))

const first = lambda(
    identifier('pair'),
    application(
        identifier('pair'),
        lambda(identifier('first'), lambda(identifier('second'), identifier('first')))
    )
)

const second = lambda(
    identifier('pair'),
    application(
        identifier('pair'),
        lambda(identifier('first'), lambda(identifier('second'), identifier('second')))
    )
)

const asPair = primitive(anExpression => {
    if (anExpression.constructor.name === 'Abstraction') {
        const firstValue = application(first, anExpression).betaReduced().betaReduced()
        const secondValue = application(second, anExpression).betaReduced().betaReduced()

        return pair(firstValue, secondValue)
    } else {
        return anExpression
    }
})

const allPrimitives = {
    asNumber,
    asPair,
    first,
    second,
    ',': makePair
}

const withPrimitiveBindings = function(expression) {
    return Object.entries(allPrimitives).reduce(
        (previous, [primitiveName, primitive]) =>
            letExpression(identifier(primitiveName), primitive, previous),
        expression
    )
}

module.exports = { withPrimitiveBindings, ...allPrimitives }
