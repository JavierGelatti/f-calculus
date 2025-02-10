import { Expression } from './expression.js'
import { identifier } from './identifier.js'

class Lambda extends Expression {
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
            return this.alphaConvertNotToHave(
                [...newValue.freeVariables(), ...this.freeVariables()].map(identifier => identifier.name)
            ).replaceFreeVariable(oldVariable, newValue)
        } else {
            return lambda(this.boundVariable, this.body.replaceFreeVariable(oldVariable, newValue))
        }
    }

    alphaConvertNotToHave(notWantedIdentifiersNames) {
        const allIdentifiers = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const newIdentifierName = allIdentifiers.find(v => !notWantedIdentifiersNames.includes(v))
        return this.alphaConvert(newIdentifierName)
    }

    alphaConvert(newIdentifierName) {
        const newIdentifier = identifier(newIdentifierName)
        if (includes(this.body.freeVariables(), newIdentifier)) throw new Error('The variable ' + newIdentifierName + ' is free in the body')
        return lambda(newIdentifier, this.body.replaceFreeVariable(this.boundVariable, newIdentifier))
    }

    freeVariables() {
        return this.body.freeVariables().
            filter(v => !v.equals(this.boundVariable))
    }

    toString() {
        return `(λ${this.boundVariable.toString()}.${this.body.toString()})`
    }

    accept(visitor) {
        return visitor.visitLambda(this)
    }

    replace(toBeReplaced, replacement) {
        if (this === toBeReplaced) {
            return replacement
        } else {
            return new Lambda(
                this.boundVariable.replace(toBeReplaced, replacement),
                this.body.replace(toBeReplaced, replacement)
            )
        }
    }
}

export function lambda(variable, body) {
    return new Lambda(variable, body)
}

function includes(list, value) {
    return list.some(v => v.equals(value))
}
