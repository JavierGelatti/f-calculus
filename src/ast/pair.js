
const { SugarExpression } = require('./sugar_expression')
const { identifier } = require('./identifier')
const { lambda } = require('./lambda')
const { application } = require('./application')

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

function pair(first, second) {
    return new Pair(first, second)
}

module.exports = { pair }
