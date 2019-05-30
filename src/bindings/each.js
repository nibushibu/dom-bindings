import domdiff from 'domdiff'

export const EachBinding = Object.seal({
  // dynamic binding properties
  childrenMap: null,
  node: null,
  root: null,
  condition: null,
  evaluate: null,
  template: null,
  nodes: [],
  getKey: null,
  indexName: null,
  itemName: null,
  afterPlaceholder: null,
  placeholder: null,

  // API methods
  mount(scope, parentScope) {
    return this.update(scope, parentScope)
  },
  update(scope, parentScope) {
    const { placeholder } = this
    const collection = this.evaluate(scope)
    const items = collection ? Array.from(collection) : []
    const parent = placeholder.parentNode

    // prepare the diffing
    const {
      newChildrenMap,
      batches,
      futureNodes
    } = createPatch(items, scope, parentScope, this)

    // patch the DOM only if there are new nodes
    if (futureNodes.length) {
      domdiff(parent, this.nodes, futureNodes, {
        before: placeholder,
        node: patch(
          Array.from(this.childrenMap.values()),
          parentScope
        )
      })
    } else {
      // remove all redundant templates
      unmountRedundant(this.childrenMap)
    }

    // trigger the mounts and the updates
    batches.forEach(fn => fn())

    // update the children map
    this.childrenMap = newChildrenMap
    this.nodes = futureNodes

    return this
  },
  unmount(scope, parentScope) {
    unmountRedundant(this.childrenMap, parentScope)

    this.childrenMap = new Map()
    this.nodes = []

    return this
  }
})

/**
 * Patch the DOM while diffing
 * @param   {TemplateChunk[]} redundant - redundant tepmplate chunks
 * @param   {*} parentScope - scope of the parent template
 * @returns {Function} patch function used by domdiff
 */
function patch(redundant, parentScope) {
  return (item, info) => {
    if (info < 0) {
      const {template, context} = redundant.pop()
      template.unmount(context, parentScope, false)
    }

    return item
  }
}

/**
 * Unmount the remaining template instances
 * @param   {Map} childrenMap - map containing the children template to unmount
 * @param   {*} parentScope - scope of the parent template
 * @returns {TemplateChunk[]} collection containing the template chunks unmounted
 */
function unmountRedundant(childrenMap, parentScope) {
  return Array
    .from(childrenMap.values())
    .map(({template, context}) => {
      return template.unmount(context, parentScope, true)
    })
}

/**
 * Check whether a template must be filtered from a loop
 * @param   {Function} condition - filter function
 * @param   {Object} context - argument passed to the filter function
 * @returns {boolean} true if this item should be skipped
 */
function mustFilterItem(condition, context) {
  return condition ? Boolean(condition(context)) === false : false
}

/**
 * Extend the scope of the looped template
 * @param   {Object} scope - current template scope
 * @param   {string} options.itemName - key to identify the looped item in the new context
 * @param   {string} options.indexName - key to identify the index of the looped item
 * @param   {number} options.index - current index
 * @param   {*} options.item - collection item looped
 * @returns {Object} enhanced scope object
 */
function extendScope(scope, {itemName, indexName, index, item}) {
  scope[itemName] = item
  if (indexName) scope[indexName] = index
  return scope
}

/**
 * Loop the current template items
 * @param   {Array} items - expression collection value
 * @param   {*} scope - template scope
 * @param   {*} parentScope - scope of the parent template
 * @param   {EeachBinding} binding - each binding object instance
 * @returns {Object} data
 * @returns {Map} data.newChildrenMap - a Map containing the new children template structure
 * @returns {Array} data.batches - array containing the template lifecycle functions to trigger
 * @returns {Array} data.futureNodes - array containing the nodes we need to diff
 */
function createPatch(items, scope, parentScope, binding) {
  const { condition, template, childrenMap, itemName, getKey, indexName, root } = binding
  const newChildrenMap = new Map()
  const batches = []
  const futureNodes = []

  /* eslint-disable fp/no-let */
  let filteredItems = 0
  /* eslint-enable fp/no-let */

  items.forEach((item, i) => {
    // the real item index should be subtracted to the items that were filtered
    const index = i - filteredItems
    const context = extendScope(Object.create(scope), {itemName, indexName, index, item})
    const key = getKey ? getKey(context) : index
    const oldItem = childrenMap.get(key)

    if (mustFilterItem(condition, context)) {
      filteredItems++
      return
    }

    const componentTemplate = oldItem ? oldItem.template : template.clone()
    const el = oldItem ? componentTemplate.el : root.cloneNode()

    if (!oldItem) {
      batches.push(() => componentTemplate.mount(el, context, parentScope))
    } else {
      batches.push(() => componentTemplate.update(context, parentScope))
    }

    // create the collection of nodes to update or to add
    futureNodes.push(el)
    // delete the old item from the children map
    childrenMap.delete(key)

    // update the children map
    newChildrenMap.set(key, {
      template: componentTemplate,
      context,
      index
    })
  })

  return {
    newChildrenMap,
    batches,
    futureNodes
  }
}

export default function create(node, { evaluate, condition, itemName, indexName, getKey, template }) {
  const placeholder = document.createTextNode('')
  const parent = node.parentNode
  const root = node.cloneNode()
  const offset = Array.from(parent.childNodes).indexOf(node)

  parent.insertBefore(placeholder, node)
  parent.removeChild(node)

  return {
    ...EachBinding,
    childrenMap: new Map(),
    node,
    root,
    offset,
    condition,
    evaluate,
    template: template.createDOM(node),
    getKey,
    indexName,
    itemName,
    placeholder
  }
}