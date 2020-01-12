const {parseExpression} = require("./src/parser")
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

// Colors and emphasis
const off = '\x1b[0m';
const bold = '\x1b[1m';
const cyan = '\x1b[36m';

function prompt(text) {
    return new Promise(accept => {
        readline.question(text, (input) => {
            accept(input)
        })
    });
}

let backlog = ''

function repl() {
    prompt(`${bold}${cyan}λ${off} `).then(code => {
        if (code === 'exit') {
            readline.close()
            console.log('bye!')
            return;
        }

        let expression
        try {
            expression = parseExpression(backlog + code)
        } catch(ex) {
            if (validSyntax(code + '._')) {
                backlog += code + '.'
                return
            } else {
                throw ex
            }
        }

        const result = expression.fullBetaReduce()
        console.log(result.toString())
    }).catch(error => {
        console.log(error);
    }).then(repl)
}

function validSyntax(text) {
    try {
        parseExpression(text)
        return true
    } catch(ex) {
        return false
    }
}

repl()
