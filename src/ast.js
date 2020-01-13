class Expression {
    fullBetaReduce() {
        var lastExpression = undefined
        var currentExpression = this

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

    replaceFreeVariable(oldVariable, newValue) {
        subclassResponsibility(this, 'replaceFreeVariable')
    }

    applyTo(argument) {
        subclassResponsibility(this, 'applyTo')
    }

    toString() {
        subclassResponsibility(this, 'toString')
    }

    accept(visitor) {
        subclassResponsibility(this, 'accept')
    }

    replace(toBeReplaced, replacement) {
        subclassResponsibility(this, 'replace')
    }

    unsugar() {
        return this
    }

}

class Hole extends Expression{
    betaReduced() {
        return this
    }

    equals(other) {
        return other === this
    }

    freeVariables() {
        return []
    }

    replaceFreeVariable(oldVariable, newValue) {
        return this
    }

    applyTo(argument) {
        return new Application(this, argument)
    }

    toString() {
        return '_'
    }

    accept(visitor) {
        return visitor.visitHole(this)
    }

    replace(toBeReplaced, replacement) {
        if (this === toBeReplaced)
            return replacement
        else
            return this
    }
}

class Variable extends Expression {
    constructor(name) {
        super()
        this.name = name
    }

    betaReduced() {
        return this
    }

    replaceFreeVariable(oldVariable, newValue) {
        if (this.equals(oldVariable)) {
            return newValue
        } else {
            return this
        }
    }

    applyTo(argument) {
        return new Application(this, argument)
    }

    freeVariables() {
        return [this]
    }

    toString() {
        return this.name
    }

    accept(visitor) {
        return visitor.visitVariable(this)
    }

    replace(toBeReplaced, replacement) {
        if (this === toBeReplaced) {
            return replacement
        } else {
            return this
        }
    }
}

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
            return new Abstraction(this.boundVariable, this.body.replaceFreeVariable(oldVariable, newValue))
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
        return new Abstraction(newVariable, this.body.replaceFreeVariable(this.boundVariable, newVariable))
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
        const thing = new JsValue(anArgument => {
            const reducedArgument = anArgument.fullBetaReduce()

            if (reducedArgument instanceof JsValue) {
                return new JsValue(reducedArgument.value + 1)
            } else {
                return application(thing, anArgument)
            }
        })
        const value = application(
            application(this, thing),
            new JsValue(0)
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

class JsValue extends Expression {
    constructor(jsValue, stringRepresentation = undefined) {
        super()
        this.value = jsValue
        this.stringRepresentation = stringRepresentation
    }

    freeVariables() {
        return []
    }

    replaceFreeVariable(oldVariable, newValue) {
        return this
    }

    betaReduced() {
        return this;
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
}

function includes(list, value) {
    return list.some(v => v.equals(value))
}

class Application extends Expression {
    constructor(abstraction, argument) {
        super()
        this.abstraction = abstraction
        this.argument = argument
    }

    betaReduced() {
        return this.abstraction.applyTo(this.argument)
    }

    applyTo(argument) {
        return new Application(this.betaReduced(), argument)
    }

    replaceFreeVariable(oldVariable, newValue) {
        return new Application(
            this.abstraction.replaceFreeVariable(oldVariable, newValue),
            this.argument.replaceFreeVariable(oldVariable, newValue)
        )
    }

    freeVariables() {
        return [...new Set([...this.abstraction.freeVariables(), ...this.argument.freeVariables()])]
    }

    toString() {
        return `(${this.abstraction.toString()} ${this.argument.toString()})`
    }

    accept(visitor) {
        return visitor.visitApplication(this)
    }

    replace(toBeReplaced, replacement) {
        if (this === toBeReplaced) {
            return replacement
        } else {
            return new Application(
                this.abstraction.replace(toBeReplaced, replacement),
                this.argument.replace(toBeReplaced, replacement)
            )
        }
    }
}

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

class LetExpression extends SugarExpression {
    constructor(variable, value, expression) {
        super()
        this.variable = variable;
        this.value = value;
        this.expression = expression;
    }

    unsugar() {
        return application(
            lambda(this.variable, this.expression.unsugar()),
            this.value.unsugar()
        )
    }

    toString() {
        return `let ${this.variable.toString()} = ${this.value.toString()}. ${this.expression.toString()}`
    }
}

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

class NumberLiteral extends SugarExpression {
    constructor(value) {
        if (typeof value !== 'number') throw new Error(`${value} is not a number`)
        super()
        this.value = value
    }

    unsugar() {
        let body = variable('x')
        for (let i = 0; i < this.value; i++) {
            body = application(variable('f'), body)
        }
        return lambda(variable('f'), lambda(variable('x'), body))
    }

    toString() {
        return this.value.toString()
    }

    applyTo(argument) {
        if (argument instanceof NumberLiteral) {
            return new NumberLiteral(Math.pow(argument.value, this.value))
        } else {
            return this.unsugar().applyTo(argument)
        }
    }

    freeVariables() {
        return []
    }

    replaceFreeVariable(oldVariable, newValue) {
        return this
    }
}

function variable(name) {
    return new Variable(name)
}

function number(value) {
    return new NumberLiteral(value)
}

function lambda(variable, body) {
    return new Abstraction(variable, body)
}

function application(abstraction, argument) {
    return new Application(abstraction, argument)
}

function js(javascriptValue, stringRepresentation = undefined) {
    return new JsValue(javascriptValue, stringRepresentation)
}

function infixApplication(abstraction, argument1, argument2) {
    return new InfixApplication(abstraction, argument1, argument2)
}

function apply(abstraction, argument) {
    return application(abstraction, argument).betaReduced()
}

function hole() {
    return new Hole()
}

function letExpression(variable, value, expression) {
    return new LetExpression(variable, value, expression);
}

function subclassResponsibility(object, methodName) {
    throw new Error(`${object.constructor.name}#${methodName}: subclass responsibility`)
}

module.exports = { Variable, Abstraction, Application, InfixApplication, Hole, LetExpression, NumberLiteral, js, number, variable, letExpression, application, infixApplication, lambda, hole, apply }
