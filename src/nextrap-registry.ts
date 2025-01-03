export type Example = {
    title: string;
    description: string;
    lang: "html"|"js"|"ts"|"css";
    code: string;
    html?: string|null;
}

export type Description = {
    package: string;
    description: string;
    title: string;
    examples: Example[];
}

export const Nextrap: Description[] = [];

const params = new URLSearchParams(window.location.search);
export let pinnedPackage: string | null = params.get('pin');
export let fullscreenComponent: { package: string, example: string } | null = null;

const fsParam = params.get('fs');
if (fsParam) {
    const [pkg, ...exampleParts] = fsParam.split('--');
    fullscreenComponent = {
        package: pkg,
        example: exampleParts.join('-')
    };
}

function updateUrlParameters() {
    const params = new URLSearchParams(window.location.search);

    if (pinnedPackage) {
        params.set('pin', pinnedPackage);
    } else {
        params.delete('pin');
    }

    if (fullscreenComponent) {
        params.set('fs', `${fullscreenComponent.package}--${fullscreenComponent.example}`);
    } else {
        params.delete('fs');
    }

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
}

export function triggerInitialState() {
    if (pinnedPackage) {
        window.dispatchEvent(new CustomEvent('package-pinned', {
            detail: { package: pinnedPackage }
        }));
    }

    if (fullscreenComponent) {
        window.dispatchEvent(new CustomEvent('fullscreen-changed', {
            detail: fullscreenComponent
        }));
    }
}

export function registerComponent(component: Description) {
    Nextrap.push(component);
}

export function pinPackage(packageName: string | null) {
    pinnedPackage = packageName;
    updateUrlParameters();
    window.dispatchEvent(new CustomEvent('package-pinned', {
        detail: { package: packageName }
    }));
}

export function setFullscreen(packageName: string | null, exampleTitle: string | null) {
    if (packageName && exampleTitle) {
        fullscreenComponent = { package: packageName, example: exampleTitle };
    } else {
        fullscreenComponent = null;
    }
    updateUrlParameters();
    window.dispatchEvent(new CustomEvent('fullscreen-changed', {
        detail: fullscreenComponent
    }));
}

window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    pinnedPackage = params.get('pin');

    const fsParam = params.get('fs');
    if (fsParam) {
        const [pkg, ...exampleParts] = fsParam.split('--');
        fullscreenComponent = {
            package: pkg,
            example: exampleParts.join('-')
        };
    } else {
        fullscreenComponent = null;
    }

    triggerInitialState();
});
