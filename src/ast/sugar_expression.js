const { Expression } = require('./expression')
const { subclassResponsibility } = require('./../utils')

class SugarExpression extends Expression {
    betaReduced() {
        return this.unsugar().betaReduced()
    }

    unsugar() {
        subclassResponsibility(this, 'unsugar')
    }

    freeVariables() {
        return this.unsugar().freeVariables()
    }

    replaceFreeVariable(oldVariable, newValue) {
        return this.unsugar().replaceFreeVariable(oldVariable, newValue)
    }

    applyTo(argument) {
        return this.unsugar().applyTo(argument)
    }
}

module.exports = { SugarExpression }
