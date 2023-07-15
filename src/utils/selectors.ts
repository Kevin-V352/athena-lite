/** @module utils/selectors */

/**
 * Short function to select DOM nodes.
 * @param {string} id node ID.
 * @returns {HTMLElement | null} HTML element (if it exists).
 */
const byId = (id: string): HTMLElement | null => document.getElementById(id);

export {
  byId
};
