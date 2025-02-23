import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { Example, Nextrap, pinnedPackage, pinPackage, setFullscreen, fullscreenComponent } from "../nextrap-registry";
import { ka_create_element } from "@kasimirjs/core";

@customElement('nx-doc-visualizer')
class PackageComponent extends LitElement {
    @property({ type: String }) package = "undefined";
    @state() private isVisible: boolean = true;
    @state() private fullscreenExample: Example | null = null;
    @state() private windowWidth: number = window.innerWidth;
    @state() private expandedExamples: Set<string> = new Set();

    constructor() {
        super();

        window.addEventListener('package-pinned', ((e: CustomEvent) => {
            this.isVisible = !e.detail.package || e.detail.package === this.package;
            this.requestUpdate();
        }) as EventListener);

        window.addEventListener('fullscreen-changed', ((e: CustomEvent) => {
            if (e.detail && e.detail.package === this.package) {
                const doc = Nextrap.find((description) => description.package === this.package);
                if (doc) {
                    const example = doc.examples.find(ex => ex.title === e.detail.example);
                    if (example) {
                        this.setFullscreenState(example);
                    }
                }
            } else if (this.fullscreenExample) {
                this.exitFullscreen();
            }
        }) as EventListener);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.fullscreenExample) {
                this.exitFullscreen();
            }
        });

        window.addEventListener('resize', this.handleResize);
    }

    static styles = css`
        .package-section {
            font-family: Arial, sans-serif;
            background: white;
            box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15);
            padding: 1rem 2rem;
            margin-bottom: 2rem;
        }

        .package-section.hidden {
            display: none;
        }

        .package-header {
            border-bottom: 1px solid #eee;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
        }

        .example-section {
            margin-top: 2rem;
            padding: 1rem;
            border: 1px solid #eee;
            border-radius: 4px;
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

        .pin-button {
            float: right;
            padding: 5px 10px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
            font-size: 14px;
        }

        .pin-button:hover {
            background: #e0e0e0;
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

        .fullscreen-button {
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

        .fullscreen-button:hover {
            background: #e0e0e0;
        }

        .fullscreen-button svg {
            width: 16px;
            height: 16px;
        }

        .render-area {
            position: relative;
        }

        .fullscreen-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }

        .fullscreen-content {
            background: white;
            position: relative;
            width: 100%;
            height: 100%;
            overflow: auto;
            padding: 4rem 2rem 2rem 2rem;
            box-sizing: border-box;
        }

        .fullscreen-content .render-area {
            border: none;
        }

        .close-fullscreen {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 0.5rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .close-fullscreen:hover {
            color: #000;
        }

        .example-section {
            position: relative;
        }

        .window-width-display {
            position: fixed;
            bottom: 1rem;
            left: 1rem;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            z-index: 1001;
        }
    `;

    private handleResize = () => {
        this.windowWidth = window.innerWidth;
    }

    private handlePin() {
        if (pinnedPackage === this.package) {
            pinPackage(null);
        } else {
            pinPackage(this.package);
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

    private setFullscreenState(example: Example) {
        this.fullscreenExample = example;
        document.body.style.overflow = 'hidden';
        this.setAttribute('fullscreen', '');
    }

    private showFullscreen(example: Example) {
        this.setFullscreenState(example);
        setFullscreen(this.package, example.title);
    }

    private exitFullscreen() {
        document.body.style.overflow = '';
        this.removeAttribute('fullscreen');
        this.fullscreenExample = null;
        setFullscreen(null, null);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this.handleResize);
        this.clearAllSlots();
    }

    render() {
        let doc = Nextrap.find((description) => description.package === this.package);

        if (!doc) {
            return html`<div>Package not found</div>`;
        }

        if (this.isVisible) {
            this.clearAllSlots();
            doc.examples.forEach((example) => {
                let e = ka_create_element("slot", {slot: "html" + example.title}, example.code);
                e.innerHTML = example.code;
                this.appendChild(e);
            });

            if (this.fullscreenExample) {
                let e = ka_create_element("slot", {slot: "htmlfullscreen"}, this.fullscreenExample.code);
                e.innerHTML = this.fullscreenExample.code;
                this.appendChild(e);
            }
        }

        return html`
            <section class="package-section ${this.isVisible ? '' : 'hidden'}">
                <div class="package-header">
                    <h2>
                        ${doc.title}
                        <button class="pin-button" @click=${this.handlePin}>
                            ${pinnedPackage === this.package ? 'Unpin' : 'Pin'}
                        </button>
                    </h2>
                    <p>${doc.description}</p>
                </div>

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
                                    class="fullscreen-button"
                                    @click=${() => this.showFullscreen(example)}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                    </svg>
                                    Fullscreen
                                </button>
                                <slot name=${"html" + example.title}></slot>
                            </div>
                        </div>
                    </section>
                `)}

                ${this.fullscreenExample ? html`
                    <div class="fullscreen-overlay" @click=${(e: Event) => e.target === e.currentTarget && this.exitFullscreen()}>
                        <div class="fullscreen-content">
                            <button class="close-fullscreen" @click=${this.exitFullscreen}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Close
                            </button>
                            <div class="render-area">
                                <slot name="htmlfullscreen"></slot>
                            </div>
                            <div class="window-width-display">
                                Width: ${this.windowWidth}px
                            </div>
                        </div>
                    </div>
                ` : ''}
            </section>
        `;
    }
}
