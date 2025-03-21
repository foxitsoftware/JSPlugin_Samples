window.createHighlightAnnot = () => {};
window.deleteHighlightAnnot = () => {};
window.createUnderlineAnnot = () => {};

window.onload = async () => {
    // const PluginApp = window.Foxit.PluginApp;
    // const PDFDictionary = window.Foxit.PDFDictionary;
    // const PDFString = window.Foxit.PDFString;
    // const PDFArray = window.Foxit.PDFArray;

    const {
        PluginApp,
        PDFDictionary,
        PDFString,
        PDFArray
    } = window.Foxit;
    const app = await PluginApp.create({
        pluginInfo: {
            id: 'Annot',
            name: 'Annot',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });

    window.createHighlightAnnot = async () => {
        let doc = await app.getActiveDoc();
        if (doc === null) {
            throw new Error('no active doc');
        }
        let docView = await doc.getCurrentDocView();
        if (docView === null) {
            throw new Error('docView is null');
        }
        let pageView = await docView.getCurrentPageView();
        console.log(pageView);

        let fpdObject = await PDFDictionary.create();
        let fpdfstringAnnot = await PDFString.create({ "str": "Annot" });
        await fpdObject.addValue('Type', fpdfstringAnnot);
        let fpdfstringSubtype = await PDFString.create({ "str": "Highlight" });
        await fpdObject.addValue('Subtype', fpdfstringSubtype);

        let rectFirst = { left: 100, top: 500, right: 300, bottom: 300 };

        let quad = await PDFArray.create();
        await quad.addNumber(rectFirst.left);
        await quad.addNumber(rectFirst.top);
        await quad.addNumber(rectFirst.right);
        await quad.addNumber(rectFirst.top);
        await quad.addNumber(rectFirst.left);
        await quad.addNumber(rectFirst.bottom);
        await quad.addNumber(rectFirst.right);
        await quad.addNumber(rectFirst.bottom);
        await fpdObject.addValue('QuadPoints', quad);

        let quadColor = await PDFArray.create();
        await quadColor.addNumber(1);
        await quadColor.addNumber(0);
        await quadColor.addNumber(0);
        await fpdObject.addValue('C', quadColor);

        let fpdfstringPopout = await PDFString.create({ "str": "This is initial text" });
        await fpdObject.addValue('Contents', fpdfstringPopout);
        await fpdObject.setAtRect('Rect', rectFirst);
        await pageView.addAnnot(fpdObject, 0);
        doc.reloadPage();
    }

    window.deleteHighlightAnnot = async () => {
        let doc = await app.getActiveDoc();
        if (doc === null) {
            throw new Error('no active doc');
        }
        let docView = await doc.getCurrentDocView();
        if (docView === null) {
            throw new Error('docView is null');
        }
        let pageView = await docView.getCurrentPageView();
        console.log(pageView);
        let count = await pageView.getAnnotCount();
        console.log(count);
        for (let i = 0; i < count; i++) {
            let annot = await pageView.getAnnotByIndex(i);
            let type = await annot.getType();
            if (type === 'Highlight') {
                await pageView.deleteAnnot(annot);
            }
        }
        doc.reloadPage();
    }

    window.modifyHightlightAnnot = async () => {
        let doc = await app.getActiveDoc();
        if (doc === null) {
            throw new Error('no active doc');
        }
        let docView = await doc.getCurrentDocView();
        if (docView === null) {
            throw new Error('docView is null');
        }
        let pageView = await docView.getCurrentPageView();
        console.log(pageView);
        let count = await pageView.getAnnotCount();
        console.log(count);
        for (let i = 0; i < count; i++) {
            let annot = await pageView.getAnnotByIndex(i);
            let type = await annot.getType();
            if (type != 'Highlight')
                continue;
            let obj = await annot.getAnnotDict();
            let content = await obj.getString('Contents');
            if (content === 'This is initial text') {
                await obj.setAtString('Contents', 'This is modified text for the highlight annotation');
            }
        }
        doc.reloadPage();
    }
}
