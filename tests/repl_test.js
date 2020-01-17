const { suite, test, before, assert } = require('@pmoo/testy')
const { execSync } = require('child_process')
const { repl, colors: { off, bold, cyan } } = require('../src/repl')

suite('Read Eval Print Loop', () => {
    let output
    const testConsole = { log(message) { output += message + '\n' } }

    before(() => { output = '' })

    test('correct code evaluation', async () => {
        const prompt = promptWithInput('x', 'let x = 2', 'x')

        await repl(prompt, testConsole)

        assert.that(output).isEqualTo('λ x\nλ λ 2\nλ bye!\n')
    })

    test('parse error', async () => {
        const prompt = promptWithInput('let x = let =')

        await repl(prompt, testConsole)

        assert.isTrue(output.includes('Error'))
        assert.isTrue(output.endsWith('bye!\n'))
    })
    
    test('end-to-end interaction', () => {
        const stdout = execSync(
            'node index.js',
            { input: 'let id = (\\x.x). id 42\n' }
        ).toString()

        assert.that(stdout).
            isEqualTo(`${bold}${cyan}λ${off} 42\n${bold}${cyan}λ${off} `)
    })

    function promptWithInput(...input) {
        return promptText => {
            assert.isTrue(promptText.trim().length > 0)
            assert.isTrue(promptText.endsWith(' '))

            output += 'λ '

            return Promise.resolve(input.shift() || 'exit')
        }
    }
})