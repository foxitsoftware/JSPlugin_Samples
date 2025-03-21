window.nextPage = () => {};
window.previousPage = () => {};
window.printDoc = () => {};
window.closeDoc = () => {};
window.saveDoc = () => {};
window.insertPages = () => {};
window.replacePages = () => {};
window.extractPages = () => {};
window.convertDoc = () => {};
window.getDocPermission = () => {};

window.onload = async () => {
    // const PluginApp = window.Foxit.PluginApp;
    // const PDFDictionary = window.Foxit.PDFDictionary;
    // const PDFString = window.Foxit.PDFString;
    // const PDFArray = window.Foxit.PDFArray;

    const {
        PluginApp,
        DefineConst
    } = window.Foxit;
    const app = await PluginApp.create({
        pluginInfo: {
            id: 'Document',
            name: 'Document',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });
    // let doc = await app.getActiveDoc();
    let doc = null;

    window.updatePageInfo = async () => {
        const currentDoc = await app.getActiveDoc();
        console.log('updatePageInfo');
        const curPage = await currentDoc.getCurrentPageIndex() + 1;
        const pageCount = await currentDoc.getPageCount();
        $('.page-info').text(`${curPage}/${pageCount}`);
        if (
            curPage === pageCount
        ) {
            $('.next-page').attr('disabled', true);
        } else {
            $('.next-page').attr('disabled', false);
        }
        if (
            curPage === 1
        ) {
            $('.previous-page').attr('disabled', true);
        } else {
            $('.previous-page').attr('disabled', false);
        }

        const docPermission = await doc.getPermissions();
        if ((docPermission & DefineConst.FPD_PERM_EXTRACT) === 0)
        {
            document.getElementById('btnExtract').disabled = true;
        }
        else{
            document.getElementById('btnExtract').disabled = false;
        }

        if ((docPermission & DefineConst.FPD_PERM_PRINT) === 0)
        {
                document.getElementById('btnPrint').disabled = true;
        }
        else{
                document.getElementById('btnPrint').disabled = false;
        }
    }

    const registerDocHandlerOfPDDoc = async () => {
        const docEventCallbacks = {
            onActivate: async function (clientData, pdDoc) {
                console.log("onDocActivate", clientData, pdDoc);
                doc = pdDoc;
                let docView = await doc.getCurrentDocView();
                if (docView === null) {
                    throw new Error('docView is null');
                }
                const curPageIndex = await doc.getCurrentPageIndex();
                await docView.gotoPageView(curPageIndex);
                await window.updatePageInfo();
            },
        };
        let bRet = await app.registerDocHandlerOfPDDoc(docEventCallbacks);
        console.log('app.registerDocHandlerOfPDDoc: ', bRet);
    }


    // 立即注册处理器
    await registerDocHandlerOfPDDoc();

    // 为了保持向后兼容，仍然保留全局函数
    window.registerDocHandlerOfPDDoc = registerDocHandlerOfPDDoc;

    // updatePageInfo();
    window.nextPage = async () => {
        console.log('next page');
        doc = await app.getActiveDoc();
        if(doc === null) {
            throw new Error('no active doc');
            return
        }
        let pagecount = await doc.getPageCount();
        let docView = await doc.getCurrentDocView();
        if (docView === null) {
            throw new Error('docView is null');
        }
        let pageView = await docView.getCurrentPageView();
        console.log(pageView);
        let pageIndex = await pageView.getPageIndex();
        pageIndex += 1;
        if(pageIndex >= pagecount) {
            pageIndex = pagecount - 1;
        }
        await docView.gotoPageView(pageIndex);
        await updatePageInfo();
    }

    window.previousPage = async () => {
        console.log('previous page');
        doc = await app.getActiveDoc();
        if(doc === null) {
            throw new Error('no active doc');
            return
        }
        let docView = await doc.getCurrentDocView();
        if (docView === null) {
            throw new Error('docView is null');
        }
        let pageView = await docView.getCurrentPageView();
        console.log(pageView);
        let pageIndex = await pageView.getPageIndex();
        pageIndex -= 1;
        if(pageIndex < 0) {
            pageIndex = 0;
        }
        await docView.gotoPageView(pageIndex);
        await updatePageInfo();
    }

    window.printDoc = async () => {
        console.log('print doc');
        doc = await app.getActiveDoc();
        if(doc === null) {
            throw new Error('no active doc');
            return
        }

        const docPermission = await doc.getPermissions();
        if ((docPermission & DefineConst.FPD_PERM_PRINT) === 0)
        {
            console.log('No Print Permission');
            return;
        }
        await doc.doPrint();
    }

    window.closeDoc = async () => {
        console.log('save doc');
        doc = await app.getActiveDoc();
        if(doc === null) {
            throw new Error('no active doc');
            return
        }
        await doc.close();
    }

    window.saveDoc = async () => {
        console.log('save doc');
        doc = await app.getActiveDoc();
        if(doc === null) {
            throw new Error('no active doc');
            return
        }
        await doc.doSave({
                showProgressBar: true
            });
    }

    // window.insertPages = async () => {
    //     console.log('insert page');
    //     doc = await app.getActiveDoc();
    //     if(doc === null) {
    //         throw new Error('no active doc');
    //         return
    //     }
    //     const ret = await doc.insertPages({
    //             insertAt: 0,
    //             insertDocSrc: './doc2.pdf',
    //             pageArr: [0]
    //         });
    //     if(ret)
    //         console.log('it has insert pages at first page ');
    // }

    // window.replacePages = async () => {
    //     console.log('replace page');
    //     doc = await app.getActiveDoc();
    //     if(doc === null) {
    //         throw new Error('no active doc');
    //         return
    //     }
    //     const ret = await doc.replacePages({
    //             start: 0,
    //             replaceDocSrc: './doc2.pdf',
    //             pageArr: [0]
    //         });
    //     if(ret)
    //         console.log('It has replace first page with the specified file. ');
    // }

    window.extractPages = async () => {
        console.log('extract page');
        doc = await app.getActiveDoc();
        if(doc === null) {
            throw new Error('no active doc');
            return
        }
        const docPermission = await doc.getPermissions();
        if ((docPermission & DefineConst.FPD_PERM_EXTRACT) === 0)
        {
            console.log('No Extract Permission');
            return;
        }
        const ret = await doc.extractPages([0], './extract.pdf')
        if(ret)
            console.log('It has extracted first page to new file ');
    }

    window.convertDoc = async () => {
        console.log('convert doc');
        doc = await app.getActiveDoc();
        if(doc === null) {
            throw new Error('no active doc');
            return
        }
        const bRet = await doc.convertPdfToOtherFormat2('D:\\convert.docx', 'Word文档 (*.docx)|*.docx')
        if (bRet) {
                console.log('Conver success')
        } else{
                console.log('Converfailed')
        }
    }

    window.getDocPermission = async () => {
        console.log('get doc permission');
        doc = await app.getActiveDoc();
        if(doc === null) {
            throw new Error('no active doc');
            return
        }
        const docPermission = await doc.getPermissions();
        console.log('permission:', docPermission);
        let html = '';
        if ((docPermission & DefineConst.FPD_PERM_PRINT) === 0)
        {
            console.log('No Print Permission');
            html += `<p >No Print Permission</p>`;
        }
        else
        {
            html += `<p >Has Print Permission</p>`;
        }
        if ((docPermission & DefineConst.FPD_PERM_MODIFY) === 0)
        {
            console.log('No Modify Permission');
            html += `<p >No Modify Permission</p>`;
        }
        else
        {
            html += `<p >Has Modify Permission</p>`;
        }
        if ((docPermission & DefineConst.FPD_PERM_EXTRACT) === 0)
        {
            console.log('No Extract Permission');
            html += `<p >No Extract Permission</p>`;
        }
        else
        {
            html += `<p >Has Extract Permission</p>`;
        }
        if ((docPermission & DefineConst.FPD_PERM_ANNOT_FORM) === 0)
        {
            console.log('No Annotation Permission');
            html += `<p >No Annotation Permission</p>`;
        }
        else
        {
            html += `<p >Has Annotation Permission</p>`;
        }
        $('.doc-permission').html(html);
    }
}
