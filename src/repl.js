const { withPrimitiveBindings } = require('./primitives')
const { parseExpression } = require('./parser')

// Colors and emphasis
const off = '\x1b[0m'
const bold = '\x1b[1m'
const cyan = '\x1b[36m'

let backlog = ''

function repl(prompt, console = global.console) {
    return prompt(`${bold}${cyan}λ${off} `).then(code => {
        if (code === 'exit') {
            console.log('bye!')
            return
        }

        let expression
        try {
            expression = withPrimitiveBindings(parseExpression(backlog + code))
        } catch (ex) {
            if (validSyntax(code + '._')) {
                backlog += code + '.'
                return repl(prompt, console)
            } else {
                throw ex
            }
        }

        const result = expression.fullBetaReduce()
        console.log(result.toString())
        return repl(prompt, console)
    }).catch(error => {
        console.log(error)
        return repl(prompt, console)
    })
}

function validSyntax(text) {
    try {
        parseExpression(text)
        return true
    } catch (ex) {
        return false
    }
}

module.exports = { repl, colors: { off, bold, cyan } }