const { primitive, application, number, letExpression, variable } = require('./ast')

const withPrimitiveBindings = function(expression) {
    return letExpression(variable('asNumber'), asNumber, expression)
}

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


module.exports = { withPrimitiveBindings, asNumber }
