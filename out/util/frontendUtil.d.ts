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
export declare function queryElement<T extends HTMLElement>(query: string, parent?: HTMLElement | Document): T;
//# sourceMappingURL=frontendUtil.d.ts.map