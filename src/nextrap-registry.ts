
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

export function registerComponent(component: Description) {
    Nextrap.push(component);
}
