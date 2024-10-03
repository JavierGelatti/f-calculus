import { SugarExpression } from './sugar_expression.js'
import { application } from './application.js'
import { lambda } from './lambda.js'

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

export function letExpression(variable, value, expression) {
    return new LetExpression(variable, value, expression)
}
