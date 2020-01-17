const { repl } = require('./src/repl')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

function prompt(text) {
    return new Promise(accept => {
        readline.question(text, (input) => {
            accept(input)
        })
    })
}

repl(prompt).then(() => {
    readline.close()
})
