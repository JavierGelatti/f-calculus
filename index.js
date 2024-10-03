import { createInterface } from 'readline'
import { repl } from './src/repl.js'

const readline = createInterface({
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
