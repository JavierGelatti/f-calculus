const { evaluate, parse } = require('./f_calculus')

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

        try {
            const result = evaluate(backlog + code)
            console.log(result.toString())
            return repl(prompt, console)
        } catch (ex) {
            if (validSyntax(code + '._')) {
                backlog += code + '.'
                return repl(prompt, console)
            } else {
                throw ex
            }
        }
    }).catch(error => {
        console.log(error)
        return repl(prompt, console)
    })
}

function validSyntax(text) {
    try {
        parse(text)
        return true
    } catch (ex) {
        return false
    }
}

module.exports = { repl, colors: { off, bold, cyan } }