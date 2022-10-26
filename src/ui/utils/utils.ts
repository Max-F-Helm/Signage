export function findParent(element: HTMLElement, withClass: string): HTMLElement | null {
    let parent = element.parentElement;
    while(parent != null) {
        if(parent.classList.contains(withClass))
            return parent;
        parent = parent.parentElement;
    }

    return null;
}

export function fold<I, O>(arr: I[], initialValue: O, cb: (result: O, item: I) => O): O {
    let result = initialValue;
    arr.forEach(item => {
        result = cb(result, item);
    });
    return result;
}
