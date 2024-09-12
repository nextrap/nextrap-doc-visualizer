import {nextrapDoc} from "../nextrap-registry";
import {ka_create_element} from "@kasimirjs/core/dist/create-element";


const html = `

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

<div id="wrapper">
    <div>
        <div class="header" id="header1">html</div>
        <div  id="html">
            <slot name="example">

        </div>
    </div>
    <div>
        <div class="header" id="header2">code</div>
        <pre class="line-numbers" id="code">

        </pre>

    </div>
</div>

`;




class ExampleVisualizer extends HTMLElement {


    constructor() {
        super();
    }

    connectedCallback() {
        let shadowRoot = this.attachShadow({mode: 'open'});

        let exampleId = this.getAttribute('exampleId');
        let example = nextrapDoc().__examples[exampleId];
        if (!example) {
            this.shadowRoot.innerHTML = 'Example not found';
            return;
        }

        if (example.htmlCode) {
            this.appendChild(ka_create_element("div", {slot: 'example'})).innerHTML = example.htmlCode;

        }
        shadowRoot.innerHTML = html;
        if (example.mdCode) {
            let codeBlock = shadowRoot.querySelector("#code");
            codeBlock.innerHTML = '';

            // remove trailing empty lines
            let lines = example.mdCode.split('\n');
            while (lines[0] === '') {
                lines.shift();
            }
            lines.forEach((line) => {
                if (line === '') {
                    line = '\n';

                }
                codeBlock.appendChild(ka_create_element("code")).innerText = line;

            });
        }


    }
}

customElements.define('nx-example-visualizer', ExampleVisualizer);

