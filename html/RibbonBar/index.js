window.onload = async () => {
    // const PluginApp = window.Foxit.PluginApp;
    // const PDFDictionary = window.Foxit.PDFDictionary;
    // const PDFString = window.Foxit.PDFString;
    // const PDFArray = window.Foxit.PDFArray;

    const {
        PluginApp,
        LPVOID
    } = window.Foxit;
    const app = await PluginApp.create({
        pluginInfo: {
            id: 'RibbonBar',
            name: 'RibbonBar',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });

    let btnElement = null;
    let btnDropElement = null;
    let flag = true;
    window.addRibbonButton = async () => {
        const parentWnd = await LPVOID.create();
        const ribbonBar = await app.getRibbonBar(parentWnd);
        console.log('getRibbonBar', ribbonBar);
        let category = await ribbonBar.getCategoryByName('TestCategory');
        console.log('getCategoryByName', category);
        if (_.isEmpty(category)) {
            category = await ribbonBar.addCategory('TestCategory', 'TestCategory');
            console.log('addCategory', category);
        }
        let panel = await category.getPanelByName('TestPanel');
        console.log('getPanelByName', panel);
        if (_.isEmpty(panel)) {
            panel = await category.addPanel('TestPanel', 'TestPanel', '');
            console.log('addPanel', panel);
        }
        btnElement = await panel.getElementByName('btnTest1');
        console.log('getElementByName:', btnElement);
        if (_.isEmpty(btnElement)) {
            btnElement = await panel.addElement({
                elementType: 0,
                name: 'btnTest1',
                title: 'btnTest1',
                pos: -1
            });
            console.log('addElement', btnElement);
            if (!(_.isEmpty(btnElement))) {
                btnElement = await panel.getElementByName('btnTest1');
                console.log('getElementByName:', btnElement);
            }

            let executeProc = {
                onExecute: async (clientData) => {
                    console.log('This is a button', clientData);
                    //alert('This is a button');
                }
            };
            await btnElement.setExecuteProc(executeProc);
            await btnElement.setEnabled(true);
        }
        await ribbonBar.reCalcLayout(true);
    }

    window.addRibbonDropButton = async () => {
        const parentWnd = await LPVOID.create();
        const ribbonBar = await app.getRibbonBar(parentWnd);
        console.log('getRibbonBar', ribbonBar);
        let category = await ribbonBar.getCategoryByName('TestCategory');
        console.log('getCategoryByName', category);
        if (_.isEmpty(category)) {
            category = await ribbonBar.addCategory('TestCategory', 'TestCategory');
            console.log('addCategory', category);
        }
        let panel = await category.getPanelByName('TestDropButtonPanel');
        console.log('getPanelByName', panel);
        if (_.isEmpty(panel)) {
            panel = await category.addPanel('TestDropButtonPanel', 'TestDropButtonPanel', '');
            console.log('addPanel', panel);
        }
        btnDropElement = await panel.getElementByName('TestDropButton');
        console.log('getElementByName:', btnDropElement);
        if (_.isEmpty(btnDropElement)) {
            btnDropElement = await panel.addElement({
                elementType: 0,
                name: 'TestDropButton',
                title: 'TestDropButton',
                pos: -1
            });
            console.log('addElement', btnDropElement);
            if (!(_.isEmpty(btnDropElement))) {
                btnDropElement = await panel.getElementByName('TestDropButton');
                console.log('getElementByName:', btnDropElement);
            }
        }

        await btnDropElement.addSubItem({
            elementType: 0,
            name: 'TestDropButtonSubItem1',
            title: 'TestDropButtonSubItem1',
            pos: -1,
            isOnTop: true,
            isChangeFun: false,
            isChangeImage: false
        });
        const subElement = await btnDropElement.getSubElementByName('TestDropButtonSubItem1');
        console.log('FRRibbonElement.getSubElementByName1: ', subElement);
        if (!(_.isEmpty(subElement))) {
            console.log('SubElementByName1 is not empty');
            let executeProc = {
                onExecute: async (clientData) => {
                    console.log("This is a drop button1", clientData);
                    //alert('This is a drop button1');
                }
            };
            await subElement.setExecuteProc(executeProc);
        }


        await btnDropElement.addSubItem({
            elementType: 0,
            name: 'TestDropButtonSubItem2',
            title: 'TestDropButtonSubItem2',
            pos: -1,
            isOnTop: true,
            isChangeFun: false,
            isChangeImage: false
        });
        const subElement2 = await btnDropElement.getSubElementByName('TestDropButtonSubItem2');
        console.log('FRRibbonElement.getSubElementByName2: ', subElement2);
        if (!(_.isEmpty(subElement2))) {
            console.log('SubElementByName2 is not empty');
            let executeProc = {
                onExecute: async (clientData) => {
                    console.log("This is a drop button2", clientData);
                    //alert('This is a drop button2');
                }
            };
            await subElement2.setExecuteProc(executeProc);
        }
        await ribbonBar.reCalcLayout(true);
    }
    window.setFlag = async () => {
        flag = !flag;
        console.log(flag);
        await btnElement.setEnabled(flag);
        const setFlagEle = document.getElementById('setFlag');
        setFlagEle.innerText = flag ? 'Disabled' : 'Enabled';
    }
}
