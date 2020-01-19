const { primitive, application, number, letExpression, variable, lambda, pair } = require('./ast')

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

const makePair = lambda(variable('first'), lambda(variable('second'), pair(variable('first'), variable('second'))))

const first = lambda(
    variable('pair'),
    application(
        variable('pair'),
        lambda(variable('first'), lambda(variable('second'), variable('first')))
    )
)

const second = lambda(
    variable('pair'),
    application(
        variable('pair'),
        lambda(variable('first'), lambda(variable('second'), variable('second')))
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
            letExpression(variable(primitiveName), primitive, previous),
        expression
    )
}

module.exports = { withPrimitiveBindings, ...allPrimitives }
