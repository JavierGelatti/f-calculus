import globals from 'globals'

export default [
    {
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly',
            },
        },
        rules: {
            'object-curly-spacing': ['error', 'always'],
            'space-before-function-paren': [
                'error',
                {
                    anonymous: 'never',
                    named: 'never',
                    asyncArrow: 'always',
                },
            ],
            'space-before-blocks': ['error'],
            'keyword-spacing': ['error'],
            'space-in-parens': ['error'],
            'no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            indent: ['error', 4],
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'never'],
        },
    },
]
