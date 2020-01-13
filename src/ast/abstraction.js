const { Expression } = require("./expression")
const { primitive } = require("./js_value")
const { application } = require("./application")
const { variable } = require("./variable")

class Abstraction extends Expression {
    constructor(boundVariable, body) {
        super()
        this.boundVariable = boundVariable
        this.body = body
    }

    betaReduced() {
        return this
    }

    applyTo(argument) {
        return this.body.replaceFreeVariable(this.boundVariable, argument)
    }

    replaceFreeVariable(oldVariable, newValue) {
        if (oldVariable.equals(this.boundVariable)) {
            return this
        } else if (includes(newValue.freeVariables(), this.boundVariable)) {
            return this.alphaConvertNotToHave(newValue.freeVariables()).replaceFreeVariable(oldVariable, newValue);
        } else {
            return lambda(this.boundVariable, this.body.replaceFreeVariable(oldVariable, newValue))
        }
    }

    alphaConvertNotToHave(notWantedVariables) {
        let allVariables = 'abcdefghijklmnopqrstuvwxyz'.split('')//.map(v => variable('_' + v));
        let newVariableName = allVariables.find(v => !includes(notWantedVariables, v));
        return this.alphaConvert(newVariableName);
    }

    alphaConvert(newVariableName) {
        let newVariable = variable(newVariableName);
        if (includes(this.body.freeVariables(), newVariable)) throw new Error("The variable " + newVariableName + " is free in the body")
        return lambda(newVariable, this.body.replaceFreeVariable(this.boundVariable, newVariable))
    }

    freeVariables() {
        return this.body.freeVariables().
            filter(v => !v.equals(this.boundVariable))
    }

    toString() {
        const printAsNumber = true

        if (printAsNumber) {
            const asNumber = this.asNumber();
            if (asNumber === undefined) {
                return `(λ${this.boundVariable.toString()}.${this.body.toString()})`
            } else {
                return asNumber.toString()
            }
        } else {
            return `(λ${this.boundVariable.toString()}.${this.body.toString()})`
        }
    }

    asNumber() {
        const thing = primitive(anArgument => {
            const reducedArgument = anArgument.fullBetaReduce()

            if (reducedArgument.isPrimitive()) {
                return primitive(reducedArgument.value + 1)
            } else {
                return application(thing, anArgument)
            }
        })
        const value = application(
            application(this, thing),
            primitive(0)
        ).fullBetaReduce().value;

        if (typeof value === 'number') {
            return value
        } else {
            return undefined
        }
    }

    accept(visitor) {
        return visitor.visitAbstraction(this)
    }

    replace(toBeReplaced, replacement) {
        if (this === toBeReplaced) {
            return replacement
        } else {
            return new Abstraction(
                this.boundVariable.replace(toBeReplaced, replacement),
                this.body.replace(toBeReplaced, replacement)
            )
        }
    }
}

function lambda(variable, body) {
    return new Abstraction(variable, body)
}

function includes(list, value) {
    return list.some(v => v.equals(value))
}

module.exports = { lambda }
