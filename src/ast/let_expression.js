
const { SugarExpression } = require('./sugar_expression')
const { application } = require('./application')
const { lambda } = require('./lambda')

class LetExpression extends SugarExpression {
    constructor(variable, value, expression) {
        super()
        this.variable = variable
        this.value = value
        this.expression = expression
    }

    unsugar() {
        return application(
            lambda(this.variable, this.expression),
            this.value
        )
    }

    toString() {
        return `let ${this.variable.toString()} = ${this.value.toString()}. ${this.expression.toString()}`
    }
}

function letExpression(variable, value, expression) {
    return new LetExpression(variable, value, expression)
}

module.exports = { letExpression }
