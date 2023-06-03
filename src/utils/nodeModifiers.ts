/** @module utils/nodeModifiers */

/**
 * It removes all children of a parent node in the DOM.
 * @param {HTMLElement} parent Parent node.
 */
const removeAllChildNodes = (parent: HTMLElement): void => {

  parent.innerHTML = '';

};

export {
  removeAllChildNodes
};
