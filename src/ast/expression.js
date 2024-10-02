const { subclassResponsibility } = require('./../utils')

class Expression {
    fullBetaReduce() {
        let lastExpression = undefined
        let currentExpression = this

        do {
            lastExpression = currentExpression
            currentExpression = currentExpression.betaReduced()
        } while (!lastExpression.equals(currentExpression))

        return currentExpression
    }

    betaReduced() {
        subclassResponsibility(this, 'betaReduced')
    }

    equals(other) {
        return other instanceof this.constructor &&
            Object.keys(this).every(property => {
                if (this[property] && this[property].equals) {
                    return this[property].equals(other[property])
                } else {
                    return this[property] === other[property]
                }
            })
    }

    freeVariables() {
        subclassResponsibility(this, 'freeVariables')
    }

    replaceFreeVariable(_oldVariable, _newValue) {
        subclassResponsibility(this, 'replaceFreeVariable')
    }

    applyTo(_argument) {
        subclassResponsibility(this, 'applyTo')
    }

    toString() {
        subclassResponsibility(this, 'toString')
    }

    accept(_visitor) {
        subclassResponsibility(this, 'accept')
    }

    replace(_toBeReplaced, _replacement) {
        subclassResponsibility(this, 'replace')
    }

    unsugar() {
        return this
    }

    isPrimitive() {
        return false
    }
}

module.exports = { Expression }
