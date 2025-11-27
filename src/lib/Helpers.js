
/**
 * Helper for setting inline styles on elements generated via document.createElement.
 * @param {HTMLElement} element JS DOM element.
 * @param {Obj} styleObj Object with CSS styles as keys and style values as values.
 */
export const setStyle = function(element, styleObj) {
    for (const key of Object.keys(styleObj)) {
        element.style[key] = styleObj[key];
    }
}