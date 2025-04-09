export type Example = {
    title: string;
    description: string;
    lang: "html"|"js"|"ts"|"css";
    code: string;
    html?: string|null;
    renderAsIframe?: boolean;
}

export type Description = {
    package: string;
    description: string;
    title: string;
    examples: Example[];
}

export const Nextrap: Description[] = [];

export let pinnedPackage: string | null = null;

export function registerComponent(component: Description) {
    Nextrap.push(component);
}
export function togglePinPackage(packageName: string) {
    if (pinnedPackage === packageName) {
        pinnedPackage = null;
    } else {
        pinnedPackage = packageName;
    }

    const url = new URL(window.location.href);
    if (pinnedPackage) {
        url.searchParams.set('pin', pinnedPackage);
    } else {
        url.searchParams.delete('pin');
    }
    window.history.pushState({ pinnedPackage: pinnedPackage }, '', url.toString());

    window.dispatchEvent(new CustomEvent('package-pinned', {
        detail: { package: pinnedPackage }
    }));
}

window.addEventListener('popstate', (event) => {
    const params = new URLSearchParams(window.location.search);
    const pinFromUrl = params.get('pin');

    if (pinnedPackage !== pinFromUrl) {
        pinnedPackage = pinFromUrl;
        window.dispatchEvent(new CustomEvent('package-pinned', {
            detail: { package: pinnedPackage }
        }));
    }
});
