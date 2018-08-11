/**
 * Remove the child nodes from any DOM node
 * @param   {HTMLElement} node - target node
 * @returns {undefined}
 */
export default function cleanNode(node) {
  const children = node.childNodes
  children.forEach(n => node.removeChild(n))
}