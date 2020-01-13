const { hole } = require('./ast/hole')
const { variable } = require('./ast/variable')
const { application } = require('./ast/application')
const { lambda } = require('./ast/abstraction')
const { primitive } = require('./ast/js_value')
const { letExpression } = require('./ast/let_expression')
const { infixApplication } = require('./ast/infix_application')
const { number } = require('./ast/number_literal')

module.exports = { js: primitive, number, variable, letExpression, application, infixApplication, lambda, hole }
