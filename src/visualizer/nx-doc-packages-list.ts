import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {Example, Nextrap} from "../nextrap-registry";
import {ka_create_element} from "@kasimirjs/core";
import {ka_dom_ready} from "@kasimirjs/core/src/await/dom-ready";





@customElement('nx-doc-packages-list')
class PackageComponent extends LitElement {
    @property({ type: String }) package = "undefined";

    static styles = css`
    .package-section {
      margin-bottom: 20px;
    }`;

     render() {


         (async() => {
            await ka_dom_ready();
            Nextrap.map((description) => {
                this.appendChild(ka_create_element('nx-doc-visualizer', {package: description.package}));
            })
        })();


        return html`
            <div id="component-container">
                <slot></slot>
            </div>
        `;
    }
}


