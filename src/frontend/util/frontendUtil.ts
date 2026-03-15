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
export function queryElement<T extends HTMLElement>(query: string, parent: HTMLElement | Document = document): T {
    const element = parent.querySelector<T>(query);
    if (element === null)
        throw new Error(`Couldn't fine element with query ${query}`);

    return element;
}

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export async function delay(ms: number, callback: () => any): Promise<any> {
    await sleep(ms);
    return callback();
}

