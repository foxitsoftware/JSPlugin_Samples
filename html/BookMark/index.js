window.addBookmark = () => {};
window.insertBookmark = () => {};
window.moveBookmark = () => {};
window.deleteBookmark = () => {};
window.destination = () => {};
window.color = () => {};
window.getTitle = () => {};
window.fontStyle = () => {};
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
    window.addBookmark = async () => {
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const bookmarkPanel = await BookmarkPanel.create();
        book_01 = await bookmarkPanel.addBookmark(doc, 'book_01');
        book_02 = await bookmarkPanel.addBookmark(doc, 'book_02');
        book_03 = await bookmarkPanel.addBookmark(doc, 'book_03');
    }

    window.insertBookmark = async () => {
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const bookmarkPanel = await BookmarkPanel.create();
        book_02_01 = await bookmarkPanel.insertBookmark(doc, 'book_02_01', null, book_02);
        console.log('insertBookmark', book_02_01);
        // book_02_01 = await bookmarkPanel.insertBookmark(doc, 'book_02_01', book_02, null);
        // book_02_01 = await bookmarkPanel.insertBookmark(doc, 'book_02_01', null, null);
    }

    window.moveBookmark = async()=>{
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const bookmarkPanel = await BookmarkPanel.create();
        await bookmarkPanel.moveBookmark(doc, book_03, null, null);
        // await bookmarkPanel.moveBookmark(doc, book_03, null, book_01);
    }

    window.deleteBookmark = async () => {
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const bookmarkPanel = await BookmarkPanel.create();
        await bookmarkPanel.deleteBookmark(doc, book_02);
    }
    window.destination = async () => {
        if (book_01 === null) {
            return;
        }
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const dest = await book_01.destination(doc);
        console.log('Bookmark.destination', dest);
    }
    window.color = async () => {
        if (book_01 === null) {
            return;
        }
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const color = await book_01.color();
        console.log('Bookmark.color', color);
    }
    window.getTitle = async () => {
        if (book_01 === null) {
            return;
        }
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const title = await book_01.title();
        console.log('Bookmark.title', title);
    }
    window.fontStyle = async () => {
        if (book_01 === null) {
            return;
        }
        doc = await app.getActiveDoc();
        if (
            doc === null
        ) {
            return;
        }
        const fontStyle = await book_01.fontStyle();
        console.log('Bookmark.fontStyle', fontStyle);
    }
}
