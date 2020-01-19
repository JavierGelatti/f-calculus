const { execSync } = require('child_process')
const { repl, colors: { off, bold, cyan } } = require('../src/repl')

describe('Read Eval Print Loop', () => {
    let output
    const testConsole = { log(message) { output += message + '\n' } }

    beforeEach(() => { output = '' })

    test('correct code evaluation', async () => {
        const prompt = promptWithInput('x', 'let x = 2', 'x')

        await repl(prompt, testConsole)

        expect(output).toEqual('λ x\nλ λ 2\nλ bye!\n')
    })

    test('parse error', async () => {
        const prompt = promptWithInput('let x = let =')

        await repl(prompt, testConsole)

        expect(output.includes('Error')).toEqual(true)
        expect(output.endsWith('bye!\n')).toEqual(true)
    })

    test('end-to-end interaction', () => {
        const stdout = execSync(
            'node index.js',
            { input: 'let id = (\\x.x). id 42\n' }
        ).toString()

        expect(stdout).
            toEqual(`${bold}${cyan}λ${off} 42\n${bold}${cyan}λ${off} `)
    })

    function promptWithInput(...input) {
        return promptText => {
            expect(promptText.trim().length > 0).toEqual(true)
            expect(promptText.endsWith(' ')).toEqual(true)

            output += 'λ '

            return Promise.resolve(input.shift() || 'exit')
        }
    }
})