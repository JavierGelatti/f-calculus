import { subclassResponsibility } from '../utils.js'

export class Expression {
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
        return subclassResponsibility(this, 'betaReduced')
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
        return subclassResponsibility(this, 'freeVariables')
    }

    replaceFreeVariable(_oldVariable, _newValue) {
        return subclassResponsibility(this, 'replaceFreeVariable')
    }

    applyTo(_argument) {
        return subclassResponsibility(this, 'applyTo')
    }

    toString() {
        return subclassResponsibility(this, 'toString')
    }

    accept(_visitor) {
        return subclassResponsibility(this, 'accept')
    }

    replace(_toBeReplaced, _replacement) {
        return subclassResponsibility(this, 'replace')
    }

    unsugar() {
        return this
    }

    isPrimitive() {
        return false
    }
}
