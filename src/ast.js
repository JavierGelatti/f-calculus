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
        throw 'subclass responsibility'
    }

    equals(other) {
        throw 'subclass responsibility'
    }

    freeVariables() {
        throw 'subclass responsibility'
    }

    replaceFreeVariable(oldVariable, newValue) {
        throw 'subclass responsibility'
    }

    applyTo(argument) {
        throw 'subclass responsibility'
    }

    toString() {
        throw 'subclass responsibility'
    }

    accept(visitor) {
        throw 'subclass responsibility'
    }

    replace(toBeReplaced, replacement) {
        throw 'subclass responsibility'
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

    equals(anotherVariable) {
        return anotherVariable instanceof Variable &&
            this.name === anotherVariable.name
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

class VariableTBD extends Variable {
    constructor() {
        super('???')
    }

    accept(visitor) {
        return visitor.visitVariableToBeDefined(this)
    }

    equals(anotherVariable) {
        return this === anotherVariable
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
        if (includes(this.body.freeVariables(), newVariable)) throw "The variable " + newVariableName + " is free in the body"
        return new Abstraction(newVariable, this.body.replaceFreeVariable(this.boundVariable, newVariable))
    }

    equals(anotherAbstraction) {
        // TODO: Cambiar esto!
        return anotherAbstraction instanceof Abstraction &&
            this.boundVariable.equals(anotherAbstraction.boundVariable) &&
            this.body.equals(anotherAbstraction.body)
    }

    freeVariables() {
        return this.body.freeVariables().
            filter(v => !v.equals(this.boundVariable))
    }

    toString() {
        const asNumber = this.asNumber();
        if (asNumber === undefined) {
            return `(λ${this.boundVariable.toString()}.${this.body.toString()})`
        } else {
            return asNumber.toString()
        }
    }

    asNumber() {
        return application(
            application(this, new JsValue(x => x + 1)),
            new JsValue(0)
        ).fullBetaReduce().value
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
    constructor(jsValue) {
        super()
        this.value = jsValue
    }

    freeVariables() {
        return []
    }

    equals(anotherJsValue) {
        return anotherJsValue instanceof JsValue &&
            this.value === anotherJsValue.value
    }

    replaceFreeVariable(oldVariable, newValue) {
        return this
    }

    betaReduced() {
        return this;
    }

    applyTo(anArgument) {
        if (this.value instanceof Function && anArgument instanceof JsValue) {
            return new JsValue(this.value(anArgument.value))
        } else {
            return application(anArgument, this)
        }
    }

    toString() {
        return `jsValue: ${this.value.toString()}`
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

    equals(anotherApplication) {
        return anotherApplication instanceof Application &&
            this.abstraction.equals(anotherApplication.abstraction) &&
            this.argument.equals(anotherApplication.argument)
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
        throw 'subclass respo'
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

    equals(anotherLet) {
        return anotherLet instanceof LetExpression &&
            this.variable.equals(anotherLet.variable) &&
            this.value.equals(anotherLet.value) &&
            this.expression.equals(anotherLet.expression)
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

class NumberLiteral extends SugarExpression {
    constructor(value) {
        if (typeof value !== 'number') throw new Error(`${value} is not a number`)
        super()
        this.value = value
    }

    equals(anotherNumber) {
        return anotherNumber instanceof NumberLiteral &&
            this.value === anotherNumber.value
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

function variableTBD() {
    return new VariableTBD()
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

function apply(abstraction, argument) {
    return application(abstraction, argument).betaReduced()
}

function hole() {
    return new Hole()
}

function letExpression(variable, value, expression) {
    return new LetExpression(variable, value, expression);
}

module.exports = { Variable, Abstraction, Application, Hole, LetExpression, NumberLiteral, number, variable, variableTBD, letExpression, application, lambda, hole, apply }
