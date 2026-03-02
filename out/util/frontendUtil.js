"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryElement = queryElement;
/**
 * Use this to get an html element, instead of something like document.querySelector("#idk")
 *
 * @example
 * const div = queryElement<HTMLDivElement>("#test-div");
 * const input = queryElement<HTMLInputElement>("#email", div);
 *
 * @param query - CSS selector e.g. "#user-button", ".modal"
 * @param parent - where to search (defaults to document)
 *
 */
function queryElement(query, parent = document) {
    const element = parent.querySelector(query);
    if (element === null)
        throw new Error(`Couldn't fine element with query ${query}`);
    return element;
}
//# sourceMappingURL=frontendUtil.js.map