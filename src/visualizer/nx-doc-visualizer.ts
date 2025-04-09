import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Example, Nextrap, pinnedPackage, togglePinPackage } from "../nextrap-registry";
import { ka_create_element } from "@kasimirjs/core";

@customElement('nx-doc-visualizer')
class PackageComponent extends LitElement {
    @property({ type: String }) package = "undefined";
    @state() private isVisible: boolean = true;
    @state() private windowWidth: number = window.innerWidth;
    @state() private windowHeight: number = window.innerHeight;
    @state() private expandedExamples: Set<string> = new Set();

    private intersectionObserver: IntersectionObserver | null = null;

    constructor() {
        super();
        window.addEventListener('resize', this.handleResize);

        window.addEventListener('package-pinned', ((e: CustomEvent) => {
            this.isVisible = !e.detail.package || e.detail.package === this.package;
        }) as EventListener);
    }

    connectedCallback() {
        super.connectedCallback();
        this.isVisible = !pinnedPackage || pinnedPackage === this.package;
        this.setupIntersectionObserver();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this.handleResize);
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        this.clearAllSlots();
    }

    firstUpdated() {
        this.observePlaceholders();
    }

    updated(changedProperties: Map<string | number | symbol, unknown>) {
        super.updated(changedProperties);
        if (changedProperties.has('package') || changedProperties.has('isVisible')) {
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
            }
            this.setupIntersectionObserver();
            this.observePlaceholders();
        }
    }


    private setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const placeholder = entry.target as HTMLElement;
                    const iframeSrc = placeholder.dataset.iframeSrc;

                    if (iframeSrc) {
                        const iframe = document.createElement('iframe');
                        iframe.src = iframeSrc;
                        iframe.style.width = '100%';
                        iframe.style.height = '200px';
                        iframe.style.border = 'none';
                        iframe.setAttribute('frameborder', '0');
                        iframe.setAttribute('title', `Example: ${placeholder.dataset.exampleTitle || 'Component'}`);
                        iframe.setAttribute('loading', 'lazy');

                        placeholder.parentNode?.replaceChild(iframe, placeholder);
                        observer.unobserve(placeholder);
                    }
                }
            });
        }, options);
    }

    private observePlaceholders() {
        if (!this.intersectionObserver) return;

        const placeholders = this.shadowRoot?.querySelectorAll('.iframe-placeholder');
        placeholders?.forEach(placeholder => {
            this.intersectionObserver?.observe(placeholder);
        });
    }


    static styles = css`
        .package-section {
            font-family: Arial, sans-serif;
            background: white;
            box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15);
            padding: 1rem 2rem;
            margin-bottom: 2rem;
            transition: opacity 0.3s ease-in-out;
        }

        .package-section.hidden {
            opacity: 0;
            pointer-events: none;
            height: 0;
            overflow: hidden;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
        }

        .package-header {
            border-bottom: 1px solid #eee;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .package-header h2 {
             margin: 0;
        }

        .example-section {
            margin-top: 2rem;
            padding: 1rem;
            border: 1px solid #eee;
            border-radius: 4px;
            position: relative;
        }

        .code-example {
            background-color: #f5f5f5;
            margin: 1rem 0;
            padding: 1rem;
            white-space: pre-wrap;
            border-radius: 4px;
            position: relative;
        }

        .code-example.collapsed {
            max-height: 300px;
            overflow: hidden;
        }

        .code-example.collapsed::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50px;
            background: linear-gradient(transparent, #f5f5f5);
            pointer-events: none;
        }

        .expand-code-button {
            display: block;
            width: 100%;
            padding: 10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
            text-align: center;
            font-size: 14px;
        }

        .expand-code-button:hover {
            background: #e0e0e0;
        }

        .render-area {
            margin: 1rem 0;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
            position: relative;
        }

        .line-numbers {
            counter-reset: linenumber;
            position: relative;
            padding-left: 40px;
        }

        .line-numbers code {
            display: block;
            background: white;
        }

        .line-numbers code:before {
            counter-increment: linenumber;
            content: counter(linenumber);
            display: inline-block;
            padding-right: 5px;
            width: 30px;
            margin-right: 10px;
            text-align: right;
            color: gray;
            background: #f0f0f0;
            position: absolute;
            left: 0;
        }

        .example-title {
            margin: 0;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #eee;
        }

        .example-description {
            color: #666;
            margin: 0.5rem 0 1rem;
        }

        h4 {
            margin: 1rem 0 0.5rem;
            color: #444;
        }

        .iframe-placeholder {
            border: 1px dashed #ccc;
            padding: 2rem 1rem;
            text-align: center;
            color: #888;
            min-height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f9f9f9;
            border-radius: 4px;
        }

        .pin-button {
            padding: 5px 10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .pin-button:hover {
            background: #e0e0e0;
        }

        .preview-button {
            position: absolute;
            top: 1rem;
            right: 1rem;
            padding: 5px 10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 5px;
            z-index: 50;
        }
        .preview-button:hover {
            background: #e0e0e0;
        }
        .preview-button svg {
            width: 16px;
            height: 16px;
        }
    `;

    private handleResize = () => {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
    }

    private handlePin() {
        if (this.package) {
            togglePinPackage(this.package);
        }
    }

    private showIsolatedPreview(exampleTitle: string) {
        if (this.package) {
            const url = new URL(window.location.href);
            url.searchParams.set('preview', this.package);
            url.searchParams.set('example', exampleTitle);
            window.location.href = url.toString();
        }
    }


    private clearAllSlots() {
        const slots = this.querySelectorAll(`slot[slot^="html"]`);
        slots.forEach(slot => {
            if (slot.parentNode === this) {
                this.removeChild(slot);
            }
        });
    }


    render() {
        let doc = Nextrap.find((description) => description.package === this.package);

        if (!doc) {
            return html`<div>Package not found</div>`;
        }

        if (this.isVisible) {
            this.clearAllSlots();
            doc.examples.forEach((example) => {
                if (!example.renderAsIframe) {
                    const slot = ka_create_element("slot", {
                        slot: this.getHtmlSlotName(example)
                    });
                    slot.innerHTML = example.code;
                    this.appendChild(slot);
                }
            });
        }

        return html`
            <section class="package-section ${this.isVisible ? '' : 'hidden'}">
                <div class="package-header">
                    <h2>${doc.title}</h2>
                    <button class="pin-button" @click=${this.handlePin}>
                        ${pinnedPackage === this.package ? 'Unpin' : 'Pin'}
                    </button>
                </div>
                <p>${doc.description}</p>

                ${doc.examples.map((example) => html`
                    <section class="example-section">
                        <h3 class="example-title">${example.title}</h3>
                        <p class="example-description">${unsafeHTML(example.description)}</p>

                        <div>
                            <h4>Code:</h4>
                            <pre class="code-example line-numbers ${example.code.trim().split("\n").length > 20 && !this.expandedExamples.has(example.title) ? 'collapsed' : ''}">
                                ${example.code.trim().split("\n").map(
                                    (ex) => html`<code>${ex !== "" ? ex : html`<br>`}</code>`
                                )}
                            </pre>
                            ${example.code.trim().split("\n").length > 20 ? html`
                                <button
                                    class="expand-code-button"
                                    @click=${() => {
                                        if (this.expandedExamples.has(example.title)) {
                                            this.expandedExamples.delete(example.title);
                                        } else {
                                            this.expandedExamples.add(example.title);
                                        }
                                        this.requestUpdate();
                                    }}
                                >
                                    ${this.expandedExamples.has(example.title) ? 'Collapse Code' : 'Expand Code'}
                                </button>
                            ` : ''}
                        </div>

                        <div>
                            <h4>Result:</h4>
                            <div class="render-area">
                                <button
                                    class="preview-button"
                                    @click=${() => this.showIsolatedPreview(example.title)}
                                    title="Open isolated preview"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                    </svg>
                                    Preview
                                </button>

                                ${example.renderAsIframe
                                    ? html`
                                        <div
                                            class="iframe-placeholder"
                                            data-iframe-src="/render-component?package=${encodeURIComponent(this.package || '')}&example=${encodeURIComponent(example.title)}"
                                            data-package=${this.package || ''}
                                            data-example-title=${example.title}
                                        >
                                            <span>Loading example in iframe...</span>
                                        </div>
                                      `
                                    : html`<slot name=${this.getHtmlSlotName(example)}></slot>`
                                }
                            </div>
                        </div>
                    </section>
                `)}
            </section>
        `;
    }

    private getHtmlSlotName(example: Example): string {
        return `html-${example.title.replace(/\s+/g, '-')}`;
    }
}
