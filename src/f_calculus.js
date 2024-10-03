import { withPrimitiveBindings } from './primitives.js'
import { parseExpression } from './parser.js'

export * as ast from './ast.js'

export function evaluate(code) {
    return withPrimitiveBindings(parseExpression(code)).fullBetaReduce()
}

export function parse(code) {
    return parseExpression(code)
}
