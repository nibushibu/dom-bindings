/**
 * Method used to bind expressions to a DOM node
 * @param   {string|HTMLElement} html - your static template html structure
 * @param   {Array} bindings - list of the expressions to bind to update the markup
 * @returns {TemplateChunk} a new TemplateChunk object having the `update`,`mount`, `unmount` and `clone` methods
 *
 * @example
 *
 * riotDOMBindings
 *  .template(
 *   `<div expr0><!----></div><div><p expr1><!----><section expr2></section></p>`,
 *   [
 *     {
 *       selector: '[expr0]',
 *       redundantAttribute: 'expr0',
 *       expressions: [
 *         {
 *           type: 'text',
 *           childNodeIndex: 0,
 *           evaluate(scope) {
 *             return scope.time;
 *           },
 *         },
 *       ],
 *     },
 *     {
 *       selector: '[expr1]',
 *       redundantAttribute: 'expr1',
 *       expressions: [
 *         {
 *           type: 'text',
 *           childNodeIndex: 0,
 *           evaluate(scope) {
 *             return scope.name;
 *           },
 *         },
 *         {
 *           type: 'attribute',
 *           name: 'style',
 *           evaluate(scope) {
 *             return scope.style;
 *           },
 *         },
 *       ],
 *     },
 *     {
 *       selector: '[expr2]',
 *       redundantAttribute: 'expr2',
 *       type: 'if',
 *       evaluate(scope) {
 *         return scope.isVisible;
 *       },
 *       template: riotDOMBindings.template('hello there'),
 *     },
 *   ]
 * )
 */
export { default as template } from './template'

/**
 * Bind a new expression object to a single DOM node
 * @param   {HTMLElement} root - DOM node where to bind the expression
 * @param   {Object} binding - binding data
 * @returns {Expression} Expression object
 */
export { default as createBinding } from './binding'

/**
 * Object containing all the binding types
 * @type {Object}
 */
export { default as bindingTypes } from './bindings/binding-types'

/**
 * Object containing all the expression types
 * @type {Object}
 */
export { default as expressionTypes } from './expressions/expression-types'