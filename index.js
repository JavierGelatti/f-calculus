const {parseExpression} = require("./src/parser")
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

function prompt(text) {
    return new Promise(accept => {
        readline.question(text, (input) => {
            accept(input)
        })
    });
}

function repl() {
    prompt('λ ').then(code => {
        if (code === 'exit') {
            readline.close()
            console.log('bye!')
            return;
        }

        const expression = parseExpression(code)

        if (expression instanceof Array) {
            throw expression[1]
        }

        const result = expression.fullBetaReduce()
        console.log(result.toString())
    }).catch(error => {
        console.log(error);
    }).then(repl)
}

repl()
