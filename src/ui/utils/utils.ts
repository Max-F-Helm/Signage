export function findParent(element: HTMLElement, withClass: string): HTMLElement | null {
    let parent = element.parentElement;
    while(parent != null) {
        if(parent.classList.contains(withClass))
            return parent;
        parent = parent.parentElement;
    }

    return null;
}
