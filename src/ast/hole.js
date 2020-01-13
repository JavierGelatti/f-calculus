const { Expression } = require("./expression")

class Hole extends Expression {
    betaReduced() {
        return this
    }

    equals(other) {
        return other === this
    }

    freeVariables() {
        return []
    }

    replaceFreeVariable(oldVariable, newValue) {
        return this
    }

    applyTo(argument) {
        return new Application(this, argument)
    }

    toString() {
        return '_'
    }

    accept(visitor) {
        return visitor.visitHole(this)
    }

    replace(toBeReplaced, replacement) {
        if (this === toBeReplaced)
            return replacement
        else
            return this
    }
}

function hole() {
    return new Hole()
}

module.exports = { hole }
