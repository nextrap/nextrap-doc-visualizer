import {nextrapDoc} from "../nextrap-registry";


const style = `

#wrapper {
    display: block;
    padding: 1rem;
    font-size: 16px;
    font-family: Arial, sans-serif;
    background-color: white;
    margin: 1rem;
}

h1 {
    border-bottom: 1px solid #ccc;
}

`;




class DocumentationVisualizer extends HTMLElement {


    constructor() {
        super();
    }

    connectedCallback() {
        let shadowRoot = this.attachShadow({mode: 'open'});

        let exampels = nextrapDoc().__projectDocs;
        let html = '<style>' + style + '</style><div id="wrapper">';
        let examples = '';
        let slotId = 0;
        for (let key in exampels) {
            let projectDoc = exampels[key];
            html += `<h1>${projectDoc.title}</h1>`;
            for (let chapter of projectDoc.chapters) {
                html += `<h2>${chapter.title}</h2>`;
                html += `<p>${chapter.content}</p>`;
                if (chapter.example) {
                    let curSlot = slotId++;
                    console.log(chapter.example.htmlCode)
                    html += `<slot name="slot${curSlot}"></slot>`;
                    examples += `<nx-example-visualizer slot="slot${curSlot}" exampleId="${chapter.example}"></nx-example-visualizer>`;
                }
            }
        }
        this.shadowRoot.innerHTML = html + "</div>";
        this.innerHTML = examples;
    }
}

customElements.define('nx-documentation-visualizer', DocumentationVisualizer);

document.addEventListener('DOMContentLoaded', () => {
    window.document.body.appendChild(document.createElement('nx-documentation-visualizer'));

});
