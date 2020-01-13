const { Expression } = require('./expression')

class Application extends Expression {
    constructor(abstraction, argument) {
        super()
        this.abstraction = abstraction
        this.argument = argument
    }

    betaReduced() {
        return this.abstraction.applyTo(this.argument)
    }

    applyTo(argument) {
        return new Application(this.betaReduced(), argument)
    }

    replaceFreeVariable(oldVariable, newValue) {
        return new Application(
            this.abstraction.replaceFreeVariable(oldVariable, newValue),
            this.argument.replaceFreeVariable(oldVariable, newValue)
        )
    }

    freeVariables() {
        return [...new Set([...this.abstraction.freeVariables(), ...this.argument.freeVariables()])]
    }

    toString() {
        return `(${this.abstraction.toString()} ${this.argument.toString()})`
    }

    accept(visitor) {
        return visitor.visitApplication(this)
    }

    replace(toBeReplaced, replacement) {
        if (this === toBeReplaced) {
            return replacement
        } else {
            return new Application(
                this.abstraction.replace(toBeReplaced, replacement),
                this.argument.replace(toBeReplaced, replacement)
            )
        }
    }
}

function application(abstraction, argument) {
    return new Application(abstraction, argument)
}

module.exports = { application }
