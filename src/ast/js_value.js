const { Expression } = require('./expression')
const { application } = require('./application')

class JsValue extends Expression {
    constructor(jsValue, stringRepresentation = undefined) {
        super()
        this.value = jsValue
        this.stringRepresentation = stringRepresentation
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
            return this.value(anArgument)
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

function primitive(javascriptValue, stringRepresentation = undefined) {
    return new JsValue(javascriptValue, stringRepresentation)
}

module.exports = { primitive }
