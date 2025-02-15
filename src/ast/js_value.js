import { Expression } from './expression.js'
import { application } from './application.js'

class JsValue extends Expression {
    constructor(jsValue, stringRepresentation = undefined) {
        super()
        this.value = jsValue

        if (stringRepresentation) {
            this.stringRepresentation = stringRepresentation
        }
    }

    freeVariables() {
        return []
    }

    replaceFreeVariable(_oldVariable, _newValue) {
        return this
    }

    betaReduced() {
        return this
    }

    applyTo(anArgument) {
        if (this.value instanceof Function) {
            return this.value(anArgument.fullBetaReduce())
        } else {
            return application(anArgument, this)
        }
    }

    toString() {
        if (this.stringRepresentation) {
            return this.stringRepresentation
        } else {
            return `<primitive: ${this.value.toString()}>`
        }
    }

    isPrimitive() {
        return true
    }
}

export function primitive(javascriptValue, stringRepresentation = undefined) {
    return new JsValue(javascriptValue, stringRepresentation)
}
