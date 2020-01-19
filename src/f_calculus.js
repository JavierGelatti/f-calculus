const { withPrimitiveBindings } = require('./primitives')
const { parseExpression } = require('./parser')


function evaluate(code) {
    return withPrimitiveBindings(parseExpression(code)).fullBetaReduce()
}

function parse(code) {
    return parseExpression(code)
}

module.exports = { evaluate, parse }
