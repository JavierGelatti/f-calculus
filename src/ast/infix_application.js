import { SugarExpression } from './sugar_expression.js'
import { application } from './application.js'

class InfixApplication extends SugarExpression {
    constructor(operator, firstArgument, secondArgument) {
        super()
        this.operator = operator
        this.firstArgument = firstArgument
        this.secondArgument = secondArgument
    }

    unsugar() {
        return application(application(this.operator, this.firstArgument), this.secondArgument)
    }

    toString() {
        return `${this.firstArgument.toString()} ${this.operator.toString()} ${this.secondArgument.toString()}`
    }
}

export function infixApplication(abstraction, argument1, argument2) {
    return new InfixApplication(abstraction, argument1, argument2)
}
