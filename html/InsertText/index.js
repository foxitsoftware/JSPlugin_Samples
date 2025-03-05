window.onload = async () => {
    // const PluginApp = window.Foxit.PluginApp;
    // const PDFDictionary = window.Foxit.PDFDictionary;
    // const PDFString = window.Foxit.PDFString;
    // const PDFArray = window.Foxit.PDFArray;

    const {
        PluginApp,
        Doc,
        TextObject,
        TextState,
        ColorState,
        ColorSpace,
        Page
    } = window.Foxit;
    const app = await PluginApp.create({
        pluginInfo: {
            id: 'InsertText',
            name: 'InsertText',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });

    window.addText = async () => {
        console.log('addText');
        const doc = await Doc.create();
        //create a new page
        let pageDict = await doc.createPdfNewPageDict(0);
        console.log('pageDict', pageDict)
        if (pageDict === null) {
            throw new Error('Create new page failed');
        }
        const pageRect ={
            left: 0,
            top: 0,
            right: 612,
            bottom: 792
        }
        //set media box of the page
        await pageDict.setAtRect('MediaBox', pageRect);
        //create text object
        let textObj = await TextObject.create();
        console.log('FPDTextObject.New', textObj);
        //add specified font to the document
        let font = await doc.addStandardFont('Times-Bold');
        console.log('AddStandardFont', font);
        if (font === null) {
            throw new Error('Add font failed');
        }
        let typename = await font.getFontTypeName();
        console.log('GetFontTypeName', typename);
        //create text state, set font and font size
        let textState = await TextState.create();
        console.log('FPDTextState.New', textState);
        if (textState === null) {
            throw new Error('Create text state failed');
        }
        await textState.setFont(font);
        await textState.setFontSize(25);
        if (textObj === null) {
            throw new Error('Create text object failed');
        }
        await textObj.setTextState(textState);

        let colorState = await ColorState.create();
        console.log('ColorState', colorState);
        let _colorSpace = await ColorSpace.create();
        const colorSpace = await _colorSpace.getStockCS(2);
        if ( colorSpace === null ) {
            throw new Error('Get stock color space failed');
        }
        await colorState.setFillColor(colorSpace, [255, 0, 0]);
        await textObj.setColorState(colorState);
        await textObj.setPosition(200, 400);
        await textObj.setText('Hello, PDF WORLD');

        let page = await Page.create();
        console.log('FPDPage.New', page)
        if (page === null) {
            throw new Error('Create page failed');
        }
        await page.load({doc: doc, pageDict: pageDict, pageCache: true});
        let pos = await page.getLastObjectPosition();
        console.log('GetLastObjectPosition', pos);
        // add text to page
        if ( pos === null ) {
            throw new Error('pos failed');
        }
        await page.insertObject(pos, textObj);
        await page.generateContent();
        var bRet = await doc.savePdf('./InsertText.pdf', 0, true);
        console.log('doc.savePdf', bRet);
        await page.destroy();
        await app.openFromFile({'fileSrc': './InsertText.pdf'})
    }
    window.addCJKText = async () => {
        console.log('addText');
        const doc = await Doc.create();
        let pageDict = await doc.createPdfNewPageDict(0);
        if (pageDict === null) {
            throw new Error('Create new page failed');
        }
        const pageRect ={
            left: 0,
            top: 0,
            right: 612,
            bottom: 792
        }
        await pageDict.setAtRect('MediaBox', pageRect);

        let textObj = await TextObject.create();
        console.log('FPDTextObject.New', textObj);
        let font = await textObj.createCJKFont("SimSun", 12, doc);
        console.log('CreateCJKFont', font);
        let textState = await TextState.create();
        console.log('FPDTextState.New', textState);
        if (font === null) {
            throw new Error('font failed');
        }
        await textState.setFont(font);
        await textState.setFontSize(25);
        await textObj.setTextState(textState);

        let colorState = await ColorState.create();
        console.log('ColorState', colorState);
        let _colorSpace = await ColorSpace.create();
        const colorSpace = await _colorSpace.getStockCS(2);
        if (colorSpace === null) {
            throw new Error('colorSpace failed');
        }
        await colorState.setFillColor(colorSpace, [255, 0, 0]);
        await textObj.setColorState(colorState);
        await textObj.setPosition(200, 400);
        await textObj.setCJKText('你好，欢迎来到PDF世界！', font);

        let page = await Page.create();
        console.log('FPDPage.New', page)
        await page.load({doc: doc, pageDict: pageDict, pageCache: true});

        let pos = await page.getLastObjectPosition();
        console.log('GetLastObjectPosition', pos);
        // add text to page
        // if (_.isEmpty(textObj)
        //     || _.isEmpty(pos)
        // ) {
        //     return;
        // }
        await page.insertObject(pos, textObj);
        await page.generateContent();
        var bRet = await doc.savePdf('./InsertCJKText.pdf', 0, true);
        console.log('doc.savePdf', bRet);
        await page.destroy();
        await app.openFromFile({'fileSrc': './InsertCJKText.pdf'})
    }
}
