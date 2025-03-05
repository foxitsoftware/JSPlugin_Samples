window.onload = async () => {
    // const PluginApp = window.Foxit.PluginApp;
    // const PDFDictionary = window.Foxit.PDFDictionary;
    // const PDFString = window.Foxit.PDFString;
    // const PDFArray = window.Foxit.PDFArray;

    const {
        PluginApp,
        TextSelectTool,
        FloatRectArray,
    } = window.Foxit;
    const app = await PluginApp.create({
        pluginInfo: {
            id: 'SearchText',
            name: 'SearchText',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });
    let rectArr = [];
    let lastSearchText = ''; // Track last searched text

    const registerDocHandlerOfPDDoc = async () => {
        const docEventCallbacks = {
            onActivate: async function (clientData, pdDoc) {
                console.log("onDocActivate", clientData, pdDoc);
                rectArr = [];
                const resultList = document.getElementById('result-list');
                resultList.innerHTML = '';
                lastSearchText = '';
                document.getElementById('search-text').value = '';
            },
        };
        let bRet = await app.registerDocHandlerOfPDDoc(docEventCallbacks);
        console.log('app.registerDocHandlerOfPDDoc: ', bRet);
    }

    // 立即注册处理器
    await registerDocHandlerOfPDDoc();

    // 为了保持向后兼容，仍然保留全局函数
    window.registerDocHandlerOfPDDoc = registerDocHandlerOfPDDoc;


    window.searchText = async () => {
        console.log('searchText');
        const text = document.getElementById('search-text').value;
        if (_.isEmpty(text)) {
            rectArr = [];
            const resultList = document.getElementById('result-list');
            resultList.innerHTML = '';
            const li = document.createElement('li');
            li.textContent = 'Please input text.';
            li.style.color = '#666';
            li.style.fontStyle = 'italic';
            resultList.insertBefore(li, resultList.firstChild);

            console.error('Please input text');
            return;
        }

        // Check if we're searching for the same text again
        if (text === lastSearchText && document.getElementById('result-list').children.length > 0) {
            const resultList = document.getElementById('result-list');
            const li = document.createElement('li');
            li.textContent = 'Current content has been searched.';
            li.style.color = '#666';
            li.style.fontStyle = 'italic';
            resultList.insertBefore(li, resultList.firstChild);
            setTimeout(() => {
                if (li.parentNode === resultList) {
                    resultList.removeChild(li);
                }
            }, 1000);
            //alert("当前内容已经搜索完毕");
            return;
        }

        lastSearchText = text; // Update last searched text
        const resultList = document.getElementById('result-list');
        resultList.innerHTML = '';
        rectArr = [];

        let doc = await app.getActiveDoc();
        console.log('app.getActiveDoc', doc);
        let docView = await doc.getCurrentDocView();
        console.log('doc.getCurrentDocView', docView);
        let pageView = await docView.getCurrentPageView();
        console.log('docView.getCurrentPageView', pageView);
        let page = await doc.getPage(0);
        console.log('doc.getPage', page);

        //一种方式, 根据指定page，通过TextPage.create创建TextPage对象
        // let textPage = await TextPage.create({
        //     page,
        //     flag: 0,
        // });
        // await textPage.parseTextPage();
        // console.log('TextPage.create', textPage);

        //第二种方式
        let textPage = await page.getTextPage();
        let pageTextSearch = await textPage.createPageTextSearch();
        console.log('textPage.createPageTextSearch', pageTextSearch);
        let bFind = await pageTextSearch.findFirst(text, 0, 0);

        let rectArray = await FloatRectArray.create();
        while (bFind) {
            console.log('FindNext', bFind);
            let rectArrayItem = await pageTextSearch.getRectArray();
            console.log('rectArrayItem', rectArrayItem);
            if (rectArrayItem === null) {
                throw new Error('rectArrayItem failed');
            }
            let rectCount = await rectArrayItem.getSize();
            console.log('rectCount', rectCount);
            if(rectCount > 0){
                await rectArray.append(rectArrayItem);
                rectArr.push(rectArrayItem);
            }
            bFind = await pageTextSearch.findNext();
        }
        let findRectSize = await rectArray.getSize();
        console.log('findRectSize', findRectSize);
        let itemStr = '';
        if (findRectSize > 0) {
            rectArr.map((item, index) => {
                itemStr += `<li data-index="${index}">result ${index+1}: ${text}</li>`;
            });
            document.getElementById('result-list').innerHTML = itemStr;
        }
        else{
            const li = document.createElement('li');
            li.textContent = 'No results found.';
            resultList.appendChild(li);
        }
    }

    document.getElementById('result-list').addEventListener('click', function(event) {
        const target = event.target;
        if (target.tagName.toLowerCase() === 'li') {
            const index = target.getAttribute('data-index');
            selectItem(index);
        }
    });

    async function selectItem(index) {
        // 处理选中项的逻辑
        const doc = await app.getActiveDoc();
        const docView = await doc.getCurrentDocView();
        const pageView = await docView.getCurrentPageView();
        const textSelectTool = await TextSelectTool.create({ doc });
        await textSelectTool.addSelect(pageView, rectArr[index]);
    }
}
