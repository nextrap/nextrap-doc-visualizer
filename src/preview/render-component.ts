document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const packageName = urlParams.get('package');
    const exampleTitle = urlParams.get('example');
    console.log('[RenderComponent] Package Name:', packageName);
    console.log('[RenderComponent] Example Title:', exampleTitle);
    if (!packageName) {
        console.error('[RenderComponent] No package name found in URL.');
        document.body.innerHTML = '<p style="color: red;">Error: No package specified in URL.</p>';
        return;
    }

    const ParentNextrap = (window.parent as any).NextrapRegistry;
    if (!ParentNextrap) {
        console.error('[RenderComponent] Cannot access NextrapRegistry on parent window.');
        document.body.innerHTML = '<p style="color: red;">Error: Cannot access component registry.</p>';
        return;
    }

    const doc = ParentNextrap.find((description: any) => description.package === packageName);
    console.log('[RenderComponent] Found Doc:', doc);

    if (!doc) {
        console.error(`[RenderComponent] Package "${packageName}" not found in registry.`);
        document.body.innerHTML = `<p style="color: red;">Error: Package "${packageName}" not found.</p>`;
        return;
    }

    const example = exampleTitle ? doc.examples.find(ex => ex.title === exampleTitle) : doc.examples[0];
    console.log('[RenderComponent] Found Example:', example);

    if (!example) {
        console.error(`[RenderComponent] Example "${exampleTitle || '(Default)'}" not found for package "${packageName}".`);
        document.body.innerHTML = `<p style="color: red;">Error: Example "${exampleTitle || '(Not Specified)'}" not found for package "${packageName}".</p>`;
        return;
    }

    const container = document.createElement('div');
    console.log('[RenderComponent] Rendering Code:', example.code);
    container.innerHTML = example.code;

    document.body.appendChild(container);
    console.log('[RenderComponent] Component container appended to body.');
});