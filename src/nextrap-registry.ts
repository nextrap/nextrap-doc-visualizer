

let examples = [];

export type ProjectDocExampleType = {
    htmlCode?: string,
    cssCode?: string,
    jsCode?: string,
    mdCode?: string,
    title?: string,
}

export type ProjectDocChapterType = {
    title: string,
    content?: string
    example?: string
}
export type ProjectDocType = {
    title?: string,
    repoUrl?: string,
    description?: string

    chapters? : ProjectDocChapterType[]
}


export class ProjectDoc {

    #selectedProjectId: string = null;
    #currentChapter: ProjectDocChapterType = null;

    #projectExampleIndex = {}<string, number>;

    #projectDocs = {}<string, ProjectDocType>;
    #examples = {}<string, ProjectDocExampleType>;

    public selectProjectId(projectId: string) {
        this.#selectedProjectId = projectId;
        return this;
    }

    public setProjectDoc(projectDoc: ProjectDocType) {
        if (!this.#selectedProjectId) {
            throw new Error('ProjectId not selected');
        }
        if (projectDoc["chapters"] == undefined) {
            projectDoc["chapters"] = [];
        }
        this.#projectDocs[this.#selectedProjectId] = projectDoc;
        return this;
    }

    public addChapter(chapter: ProjectDocChapterType) {
        if (!this.#selectedProjectId) {
            throw new Error('ProjectId not selected');
        }
        let projectDoc = this.#projectDocs[this.#selectedProjectId];
        if (projectDoc["chapters"] == undefined) {
            projectDoc["chapters"] = [];
        }
        projectDoc["chapters"].push(chapter);
        this.#currentChapter = chapter
        return this;
    }

    public addExample(example: ProjectDocExampleType) {
        if (!this.#currentChapter) {
            throw new Error('Chapter not selected');
        }
        if ( ! this.#projectExampleIndex[this.#selectedProjectId]) {
            this.#projectExampleIndex[this.#selectedProjectId] = 0;
        }
        let index = this.#projectExampleIndex[this.#selectedProjectId]++;
        this.#examples[this.#selectedProjectId + "-" + index] = example;
        this.#currentChapter.example =  this.#selectedProjectId + "-" + index;
        return this;
    }


    public get __projectDocs() : { [key: string]: ProjectDocType }{
        return this.#projectDocs;
    }

    public get __examples() : { [key: string]: ProjectDocExampleType }{
        return this.#examples;

    }

}

const _projectDoc = new ProjectDoc();
export function nextrapDoc() : ProjectDoc  {
    return _projectDoc;
}
