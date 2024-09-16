import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {Example, Nextrap} from "../nextrap-registry";
import {ka_create_element} from "@kasimirjs/core/dist/create-element";
import {ka_dom_ready} from "@kasimirjs/core";





@customElement('nx-doc-packages-list')
class PackageComponent extends LitElement {
    @property({ type: String }) package = "undefined";

    static styles = css`
    .package-section {
      margin-bottom: 20px;
    }

  `;

    async render() {
        await ka_dom_ready();

        Nextrap.map((description) => {
            this.appendChild(ka_create_element('nx-doc-visualizer', {package: description.package, slot: "ex" + description.package}));
        })

        return html`
            <div id="component-container">
                ${Nextrap.map(
                    (description) => html`


                              ${description.examples.map(
                                    (example) => html`
                                        <slot .name=${"ex" + description.package}></slot>`
                                )}

                        `)}
            </div>
        `;
    }
}


