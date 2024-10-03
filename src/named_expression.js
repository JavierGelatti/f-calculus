import { Expression } from './ast/expression.js'

class NamedExpression extends Expression {
    constructor(name, expression) {
        super()
        this.name = name
        this.expression = expression
    }

    betaReduced() {
        const reducedExpression = this.expression.betaReduced()

        if (reducedExpression.equals(this.expression)) {
            return this
        } else {
            return reducedExpression
        }
    }

    toString() {
        return this.name
    }

    freeVariables() {
        return this.expression.freeVariables()
    }

    replaceFreeVariable(oldVariable, newValue) {
        return this.expression.replaceFreeVariable(oldVariable, newValue)
    }

    applyTo(argument) {
        return this.expression.applyTo(argument)
    }

    accept(visitor) {
        return this.expression.accept(visitor)
    }

    replace(toBeReplaced, replacement) {
        return this.expression.replace(toBeReplaced, replacement)
    }
}

export function namedExpression(name, expression) {
    return new NamedExpression(name, expression)
}
