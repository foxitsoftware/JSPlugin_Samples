window.signatureSign = () => {};
window.signatureSignByName = () => {};
window.getSignatureInfoByIndex = () => {};
window.getSignatureInfoByName = () => {};
window.clearSignatureByIndex = () => {};
window.clearSignatureByName = () => {};
window.onload = async () => {
    // const PluginApp = window.Foxit.PluginApp;
    // const PDFDictionary = window.Foxit.PDFDictionary;
    // const PDFString = window.Foxit.PDFString;
    // const PDFArray = window.Foxit.PDFArray;

    const {
        PluginApp,
        Signature,
        DefineConst,
        Enum
    } = window.Foxit;
    const app = await PluginApp.create({
        pluginInfo: {
            id: 'Signature',
            name: 'Signature',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });
    window.signatureSign = async () => {
        doc = await app.getActiveDoc();
        const sig = await Signature.create();
        const signatureInfo = {
            signAuthor: 'John Doe',
            organizationName: 'foxit',
            organizationalInfo: 'Software Development',
            emailAddress: 'john.doe@example.com',
            countryOrRegionInfo: 'United States',
            executeSign: true,
            // 按标准样式显示外观，如果要按图标的方式显示外观，那这里需要设置为false
            useStandAppearance : false,
            // 按标准样式显示外观
            showFlag: DefineConst.FR_SIG_SHOW_ALL,
            iconType: Enum.FR_SG_ICONTYPE.FR_SGIT_NAME,
            // 要显示图片的需要这样设置
            // showFlag: 0,
            // iconType: Enum.FR_SG_ICONTYPE.FR_SGIT_GRAPHICS,
            // imagePath: 'd:\\test\\signature.png',
            // imageOpacity: 100,
            password: '123456',
            permissionType: Enum.FR_SG_PERMISSION.FR_APG_NONE,
            textDir: Enum.FR_SG_TEXTDIR.FR_SGTD_AUTO,
            certFile: 'd:\\test\\John Doe.pfx',
            signDictInfo: {
                name: 'John Doe',
                reason: 'signature test',
                location: 'New York',
                filter: 'Adobe.PPKLite'
            }
        };
        if (doc) {
            docView = await doc.getCurrentDocView();
            if (docView) {
                pageView = await docView.getCurrentPageView();
            }
        }
        // @ts-ignore
        if (pageView === null) {
            console.log('pageView is null');
            return;
        }
        // @ts-ignore
        let rect = await pageView.getPageRect();
        console.log('getPageRect', rect);
        let leftValue = rect.left + ((rect.right- rect.left) / 2 - 100);
        let topValue = (rect.bottom - rect.top) / 2;
        let rightValue = leftValue + 150;;
        let bottomValue = topValue - 150;
        const signaturePosInfo = {
            fileSavePath: 'd:\\test\\signed.pdf',
            bottom: bottomValue,
            left: leftValue,
            right: rightValue,
            top: topValue,
            pageIndex: 0,
            doc: doc,
        };
        // @ts-ignore
        let bSign = await sig.signatureSign(signatureInfo, signaturePosInfo, {}, true);
        console.log('bSign', bSign);
    }
    window.signatureSignByName = async () => {
        doc = await app.getActiveDoc();
        if (doc === null) {
            console.log('doc is null');
            return;
        }
        const sig = await Signature.create();
        const signatureInfo = {
            signAuthor: 'John Doe',
            organizationName: 'foxit',
            organizationalInfo: 'Software Development',
            emailAddress: 'john.doe@example.com',
            countryOrRegionInfo: 'United States',
            executeSign: true,
            // 按标准样式显示外观，如果要按图标的方式显示外观，那这里需要设置为false
            useStandAppearance : false,
            // 按标准样式显示外观
            showFlag: DefineConst.FR_SIG_SHOW_ALL,
            iconType: Enum.FR_SG_ICONTYPE.FR_SGIT_NAME,
            // 要显示图片的需要这样设置
            // showFlag: 0,
            // iconType: Enum.FR_SG_ICONTYPE.FR_SGIT_GRAPHICS,
            // imagePath: 'd:\\test\\signature.png',
            // imageOpacity: 100,
            password: '123456',
            permissionType: Enum.FR_SG_PERMISSION.FR_APG_NONE,
            textDir: Enum.FR_SG_TEXTDIR.FR_SGTD_AUTO,
            certFile: 'd:\\test\\John Doe.pfx',
            signDictInfo: {
                name: 'John Doe',
                reason: 'signature test',
                location: 'New York',
                filter: 'Adobe.PPKLite'
            }
        };
        let bSign = await sig.signatureSignByName('Signature_0', doc, signatureInfo, 'd:\\test\\signed.pdf', true);
        console.log('bSign', bSign);
    }
    window.getSignatureInfoByIndex = async () => {
        doc = await app.getActiveDoc();
        if (doc === null) {
            console.log('doc is null');
            return;
        }
        const sig = await Signature.create();
        let count = await sig.getDocSignatureCount(doc);
        console.log('getSignatureInfoByIndex: ', count);
        for (let i = 0; i < count; i++) {
            let info = await sig.getSignatureInfoByIndex(doc, i);
            if (info) {
                console.log('getSignatureInfoByIndex: ', info);
                // @ts-ignore
                let verifyState = info.verifyState;
                if( verifyState & DefineConst.FR_SIG_VERIFY_VALID ) {
                    console.log('Signature is valid');
                } else {
                    console.log('Signature is invalid');
                }
            } else {
                console.log('getSignatureInfoByIndex failed');
            }
        }
    }
    window.getSignatureInfoByName = async () => {
        doc = await app.getActiveDoc();
        if (doc === null) {
            console.log('doc is null');
            return;
        }
        const sig = await Signature.create();
        let info = await sig.getSignatureInfoByName(doc, 'Signature_0');
        if (info) {
            console.log('SignatureBaseInfo: ', info);
            // @ts-ignore
            let verifyState = info.verifyState || 0;
            if( verifyState & DefineConst.FR_SIG_VERIFY_VALID ) {
                console.log('Signature is valid');
            } else {
                console.log('Signature is invalid');
            }
        } else {
            console.log('getSignatureInfo failed');
        }
    }

    window.clearSignatureByIndex = async () => {
        doc = await app.getActiveDoc();
        if (doc === null) {
            console.log('doc is null');
            return;
        }
        const sig = await Signature.create();
        let count = await sig.getDocSignatureCount(doc);
        console.log('getSignatureInfoByIndex: ', count);
        for (let i = 0; i < count; i++) {
            let info = await sig.getSignatureInfoByIndex(doc, i);
            if (info) {
                console.log('getSignatureInfoByIndex: ', info);
                // @ts-ignore
                if(info.signatureName === 'Signature_0') {
                    let clear = await sig.clearSignatureByIndex(doc, i);
                    if (clear) {
                        console.log('clearSignatureByIndex success');
                    } else {
                        console.log('clearSignatureByIndex failed');
                    }
                } else{
                    console.log('Signature_0 is not exist');
                }
            } else {
                console.log('getSignatureInfoByIndex failed');
            }
        }
    }
    window.clearSignatureByName = async () => {
        doc = await app.getActiveDoc();
        if (doc === null) {
            console.log('doc is null');
            return;
        }
        const sig = await Signature.create();
        let clear = await sig.clearSignatureByName(doc, 'Signature_0');
        if (clear) {
            console.log('clearSignatureByName success');
        } else {
            console.log('clearSignatureByName failed');
        }
    }
}
