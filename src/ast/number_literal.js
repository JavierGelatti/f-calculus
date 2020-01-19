const { SugarExpression } = require('./sugar_expression')
const { variable } = require('./variable')
const { lambda } = require('./abstraction')
const { application } = require('./application')

class NumberLiteral extends SugarExpression {
    constructor(value) {
        if (typeof value !== 'number') throw new Error(`${value} (${value.constructor.name}) is not a number`)
        super()
        this.value = value
    }

    unsugar() {
        let body = variable('x')
        for (let i = 0; i < this.value; i++) {
            body = application(variable('f'), body)
        }
        return lambda(variable('f'), lambda(variable('x'), body))
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

function number(value) {
    return new NumberLiteral(value)
}

module.exports = { number }
