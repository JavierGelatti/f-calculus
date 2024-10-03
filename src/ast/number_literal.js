import { SugarExpression } from './sugar_expression.js'
import { identifier } from './identifier.js'
import { lambda } from './lambda.js'
import { application } from './application.js'

class NumberLiteral extends SugarExpression {
    constructor(value) {
        if (typeof value !== 'number') throw new Error(`${value} (${value.constructor.name}) is not a number`)
        super()
        this.value = value
    }

    unsugar() {
        let body = identifier('x')
        for (let i = 0; i < this.value; i++) {
            body = application(identifier('f'), body)
        }
        return lambda(identifier('f'), lambda(identifier('x'), body))
    }

    toString() {
        return this.value.toString()
    }

    applyTo(argument) {
        if (argument instanceof NumberLiteral) {
            return new NumberLiteral(Math.pow(argument.value, this.value))
        } else {
            return this.unsugar().applyTo(argument)
        }
    }

    freeVariables() {
        return []
    }

    betaReduced() {
        return this
    }

    replaceFreeVariable(_oldVariable, _newValue) {
        return this
    }
}

export function number(value) {
    return new NumberLiteral(value)
}
