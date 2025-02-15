import { Expression } from './expression.js'
import { application } from './application.js'

class Identifier extends Expression {
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

export function identifier(name) {
    return new Identifier(name)
}
