import { SugarExpression } from './sugar_expression.js'
import { identifier } from './identifier.js'
import { lambda } from './lambda.js'
import { application } from './application.js'

class Pair extends SugarExpression {
    constructor(first, second) {
        super()
        this.first = first
        this.second = second
    }

    unsugar() {
        return lambda(identifier('f'), application(application(identifier('f'), this.first), this.second))
    }

    toString() {
        return `(${this.first.toString()}, ${this.second.toString()})`
    }

    freeVariables() {
        return [...this.first.freeVariables(), ...this.second.freeVariables()]
    }

    betaReduced() {
        return this
    }

    replaceFreeVariable(oldVariable, newValue) {
        return new Pair(
            this.first.replaceFreeVariable(oldVariable, newValue),
            this.second.replaceFreeVariable(oldVariable, newValue)
        )
    }
}

export function pair(first, second) {
    return new Pair(first, second)
}
