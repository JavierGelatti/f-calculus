const { Expression } = require('./expression')
const { application } = require('./application')

class Variable extends Expression {
    constructor(name) {
        super()
        this.name = name
    }

    betaReduced() {
        return this
    }

    replaceFreeVariable(oldVariable, newValue) {
        if (this.equals(oldVariable)) {
            return newValue
        } else {
            return this
        }
    }

    applyTo(argument) {
        return application(this, argument)
    }

    freeVariables() {
        return [this]
    }

    toString() {
        return this.name
    }

    accept(visitor) {
        return visitor.visitVariable(this)
    }

    replace(toBeReplaced, replacement) {
        if (this === toBeReplaced) {
            return replacement
        } else {
            return this
        }
    }
}

function variable(name) {
    return new Variable(name)
}

module.exports = { variable }
