import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

type Viewport = {
    name: string;
    width: number;
    height?: number;
};

const VIEWPORTS: Viewport[] = [
    { name: "Mobile", width: 360, height: 640 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Desktop", width: 1280, height: 800 },
    { name: "Full", width: 0 }
];

@customElement('nx-isolated-preview')
export class NxIsolatedPreview extends LitElement {
    @property()
    package: string = "undefined";
    @property()
    example: string | null = null;

    @state()
    private selectedViewport: Viewport = VIEWPORTS[0];

    @state()
    private zoomLevelDesktop: number = 1;

    @state()
    private zoomLevelMobile: number = 1;

    @state()
    private iframeSrc: string = '';

    connectedCallback() {
        super.connectedCallback();
        const urlParams = new URLSearchParams(window.location.search);
        this.example = urlParams.get('example');

        if (!this.example) {
            console.warn("Isolated preview loaded without 'example' parameter. Defaulting might occur in iframe.");
        }

        this.iframeSrc = `/render-component?package=${encodeURIComponent(this.package)}&example=${encodeURIComponent(this.example || '')}`;
    }
    static styles = css`
        :host {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #111;
            color: white;
            z-index: 2000;
            font-family: sans-serif;
            box-sizing: border-box;
            padding: 0;
            overflow: hidden;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            background-color: #222;
            border-bottom: 1px solid #444;
            height: 50px;
            box-sizing: border-box;
        }

        .header h2 {
            margin: 0;
            font-weight: normal;
            font-size: 1.1em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-right: 20px;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .controls-group {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .controls {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .controls label {
            font-size: 0.9em;
        }

        .controls select {
            padding: 5px 8px;
            background-color: #444;
            color: white;
            border: 1px solid #666;
            border-radius: 4px;
            font-size: 0.9em;
        }

        .zoom-controls {
             display: flex;
             align-items: center;
             gap: 5px;
        }
        .zoom-controls select {
            padding: 5px 8px;
            background-color: #444;
            color: white;
            border: 1px solid #666;
            border-radius: 4px;
            font-size: 0.9em;
        }

        .close-button {
            padding: 8px 15px;
            background-color: #555;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .close-button:hover {
            background-color: #777;
        }

        .preview-area {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: 30px;
            flex-wrap: nowrap;
            padding: 20px;
            height: calc(100% - 50px);
            overflow: auto;
            box-sizing: border-box;
            overflow: auto;
        }

        .iframe-wrapper {
            border: 1px solid #333;
            overflow: hidden;
            margin-bottom: 5px;
            position: relative;
            box-sizing: border-box;
            transform-origin: top left;
        }


        .iframe-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            text-align: center;
            flex-shrink: 0;
        }

        .iframe-label {
            font-size: 0.8em;
            color: #aaa;
        }

        iframe {
            background-color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
            width: 100%;
            height: 100%;
        }

        .iframe-container.full-width-container {
            flex-grow: 1;
            flex-shrink: 1;
            min-width: 0;
        }
    `;

    private closePreview() {
        const url = new URL(window.location.origin + window.location.pathname);
        window.location.href = url.toString();
    }

    private handleViewportChange(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        const selectedWidth = parseInt(selectElement.value, 10);
        const newViewport = VIEWPORTS.find(vp => vp.width === selectedWidth) || VIEWPORTS[0];
        console.log('[IsolatedPreview] Viewport changed. Selected width:', selectedWidth, 'Found viewport:', newViewport);
        this.selectedViewport = newViewport;
    }

    private handleZoomChangeDesktop(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        this.zoomLevelDesktop = parseFloat(selectElement.value);
    }

     private handleZoomChangeMobile(event: Event) {
        const selectElement = event.target as HTMLSelectElement;
        this.zoomLevelMobile = parseFloat(selectElement.value);
    }

    render() {
        const desktopWidth = this.selectedViewport.width === 0 ? '100%' : `${this.selectedViewport.width}px`;
        const desktopHeight = this.selectedViewport.height ? `${this.selectedViewport.height}px` : '80vh';
        const mobileWidth = '360px';
        const mobileHeight = '640px';

        console.log(`[IsolatedPreview] Rendering. Viewport: ${this.selectedViewport.name}, desktopWidth: ${desktopWidth}, desktopHeight: ${desktopHeight}`);

        return html`
            <div class="header">
                <div class="header-left">
                    <h2>Preview: ${this.package}</h2>
                    <div class="controls-group">
                        <div class="controls">
                            <label for="viewport-select">Viewport:</label>
                            <select id="viewport-select" @change=${this.handleViewportChange}>
                                ${VIEWPORTS.map(vp => html`
                                    <option value=${vp.width} ?selected=${vp.width === this.selectedViewport.width}>
                                        ${vp.name} ${vp.width > 0 ? `(${vp.width}px)` : '(Full Width)'}
                                    </option>
                                `)}
                            </select>
                        </div>
                        <div class="zoom-controls">
                            <label for="zoom-select-desktop">Zoom:</label>
                            <select id="zoom-select-desktop" @change=${this.handleZoomChangeDesktop}>
                                <option value="0.5">50%</option>
                                <option value="0.75">75%</option>
                                <option value="1" selected>100%</option>
                                <option value="1.25">125%</option>
                                <option value="1.5">150%</option>
                            </select>
                        </div>
                        ${this.selectedViewport.width !== 360 && this.selectedViewport.width !== 0 ? html`
                            <div class="zoom-controls">
                                <label for="zoom-select-mobile">Mobile Zoom:</label>
                                <select id="zoom-select-mobile" @change=${this.handleZoomChangeMobile}>
                                    <option value="0.5">50%</option>
                                    <option value="0.75">75%</option>
                                    <option value="1" selected>100%</option>
                                    <option value="1.25">125%</option>
                                    <option value="1.5">150%</option>
                                </select>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <button class="close-button" @click=${this.closePreview}>Close Preview</button>
            </div>
            <div class="preview-area">
                <div class="iframe-container ${this.selectedViewport.width === 0 ? 'full-width-container' : ''}">
                    <span class="iframe-label">${this.selectedViewport.name} View (${Math.round(this.zoomLevelDesktop * 100)}%)</span>
                     <div class="iframe-wrapper" style="width: ${desktopWidth}; height: ${desktopHeight}; transform: scale(${this.zoomLevelDesktop});">
                        <iframe
                            src=${this.iframeSrc}
                            style=""
                            frameborder="0"
                            title="${this.package} - ${this.selectedViewport.name} Preview"
                        ></iframe>
                    </div>
                </div>

                ${this.selectedViewport.width !== 360 && this.selectedViewport.width !== 0 ? html`
                    <div class="iframe-container">
                        <span class="iframe-label">Mobile View (${Math.round(this.zoomLevelMobile * 100)}%)</span>
                         <div class="iframe-wrapper" style="width: ${mobileWidth}; height: ${mobileHeight}; transform: scale(${this.zoomLevelMobile});">
                            <iframe
                                src=${this.iframeSrc}
                                style=""
                                frameborder="0"
                                title="${this.package} - Mobile Preview"
                            ></iframe>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'nx-isolated-preview': NxIsolatedPreview;
    }
}