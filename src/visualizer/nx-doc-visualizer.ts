import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {Example, Nextrap} from "../nextrap-registry";
import {ka_create_element} from "@kasimirjs/core";


const htmlCode = `

<style>
:host {
    display: block;
    font-size: 16px;
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;


}
#wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;

}
#wrapper > div {
    flex: 1;
    margin: 0
    flex-basis: 50%;
    border: 1px solid #ccc;
}
.header {
    background-color: #ddd;
    padding: 0.2rem;
    border-bottom: 1px solid #ccc;
    display: block;
    line-height: 1;;
}
#html {
    border 1px solid #ccc;
    padding: 1rem;
    background: #fff;


}

#code {
    font-family:  monospace;
    /* display as pre element break where possible*/

    background: white;


    line-height: 1.2;
    font-size: 12px;
}

.line-numbers {
  counter-reset: linenumber;
  position: relative;
  padding-left: 40px; /* Adjust according to your needs */
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
  width: 30px; /* Adjust according to your needs */
  margin-right: 10px;
  text-align: right;
  color: gray; /* Adjust according to your needs */
  background: #f0f0f0; /* Adjust according to your needs */
  position: absolute;
  left: 0;
}
</style>


`;



@customElement('nx-doc-visualizer')
class PackageComponent extends LitElement {
    @property({ type: String }) package = "undefined";

    static styles = css`

        .package-section {
            background: white;
            box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15);
            padding: 1rem 2rem;
            margin-bottom: 2rem;
        }

        .example-section {
            margin-top: 40px;
        }
        h2,h3, p {
            font-family:  Arial, sans-serif;
        }




        .code-example {
            background-color: #f5f5f5;
            margin-top: 20px;
            margin-bottom: 20px;
            padding: 10px;
            white-space: pre-wrap;
        }

        .render-area {
            margin-top: 10px;
        }

        .line-numbers {
            counter-reset: linenumber;
            position: relative;
            padding-left: 40px; /* Adjust according to your needs */
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
            width: 30px; /* Adjust according to your needs */
            margin-right: 10px;
            text-align: right;
            color: gray; /* Adjust according to your needs */
            background: #f0f0f0; /* Adjust according to your needs */
            position: absolute;
            left: 0;
        }
    `;

    render() {
        let doc = Nextrap.find((description) => description.package === this.package);

        if (!doc) {
            return html`
                <div>Package not found</div>`;

        }

        doc.examples.forEach((example) => {
            // Attach the demo to the root Dom (not the shadow dom)
            let e = ka_create_element("slot", {name: "html" + example.title}, example.code);
            e.innerHTML = example.code;
            this.appendChild(e);
        });



        return html`
            <section class="package-section">
                <h2>${doc.title}</h2>
                <p>${doc.description}</p>
                ${doc.examples.map(
            (example: Example) => html`
                        <section class="example-section">
                            <h3>${example.title}</h3>
                            <p>${example.description}</p>
                            <pre class="code-example line-numbers">${example.code.trim().split("\n").map((ex) => html`<code>${ex !== "" ? ex : html`<br>`}</code>`)}</pre>
                            <slot class="render-area" ..name=${"html1" + example.title}></slot>
                        </section>
                    `)}
            </section>
        `;
    }
}

