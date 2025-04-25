window.addBookMark = () => {};
window.insertBookMark = () => {};
window.moveBookMark = () => {};
window.deleteBookMark = () => {};
window.onload = async () => {
    // const PluginApp = window.Foxit.PluginApp;
    // const PDFDictionary = window.Foxit.PDFDictionary;
    // const PDFString = window.Foxit.PDFString;
    // const PDFArray = window.Foxit.PDFArray;

    const {
        PluginApp,
        BookmarkPanel
    } = window.Foxit;
    const app = await PluginApp.create({
        pluginInfo: {
            id: 'Bookmark',
            name: 'Bookmark',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });
    let doc;
    let book_01 = null;
    let book_02 = null;
    let book_03 = null;
    let book_02_01 = null;
    window.addBookMark = async () => {
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const bookmarkPanel = await BookmarkPanel.create();
        book_01 = await bookmarkPanel.addBookMark(doc, 'book_01');
        book_02 = await bookmarkPanel.addBookMark(doc, 'book_02');
        book_03 = await bookmarkPanel.addBookMark(doc, 'book_03');
    }

    window.insertBookMark = async () => {
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const bookmarkPanel = await BookmarkPanel.create();
        book_02_01 = await bookmarkPanel.insertBookMark(doc, 'book_02_01', null, book_02);
        console.log('insertBookMark', book_02_01);
        // book_02_01 = await bookmarkPanel.insertBookMark(doc, 'book_02_01', book_02, null);
        // book_02_01 = await bookmarkPanel.insertBookMark(doc, 'book_02_01', null, null);
    }

    window.moveBookMark = async()=>{
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const bookmarkPanel = await BookmarkPanel.create();
        await bookmarkPanel.moveBookMark(doc, book_03, null, null);
        // await bookmarkPanel.moveBookMark(doc, book_03, null, book_01);
    }

    window.deleteBookMark = async () => {
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const bookmarkPanel = await BookmarkPanel.create();
        await bookmarkPanel.deleteBookMark(doc, book_02);
    }
}
