window.signatureSign = () => {};
window.getSignatureInfo = () => {};
window.clearSignature = () => {};
window.onload = async () => {
    // const PluginApp = window.Foxit.PluginApp;
    // const PDFDictionary = window.Foxit.PDFDictionary;
    // const PDFString = window.Foxit.PDFString;
    // const PDFArray = window.Foxit.PDFArray;
    let myTable = $('#myTable').DataTable({
        paging: false,
        searching: false,
        scrollX: true,
        ordering:  false,
        info: false,
        data: [],
    });
    // 输入框有值时启用按钮，无值时禁用按钮
    $('#signatureName').on('input', function() {
        if ($(this).val() !== '') {
            $('#clearSignatureBtn').removeAttr('disabled');
        } else {
            $('#clearSignatureBtn').attr('disabled', 'disabled');
        }
    });
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
        $('#signatureInfo').hide();

        doc = await app.getActiveDoc();
        const sig = await Signature.create();
        const signatureInfo = {
            signAuthor: 'Foxit JSPlugin SDK',
            organizationName: 'Foxit',
            organizationalInfo: 'Foxit Software Development',
            emailAddress: 'support@foxitsoftware.com',
            countryOrRegionInfo: 'China',
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
            // 证书文件路径,请根据实际情况修改，例如：'d:\\test\\foxit.pfx'，你可以使用这个示例中的foxit.pfx证书文件
            // 并且在使用前，请点击安装这个证书
            certFile: 'd:\\test\\foxit.pfx',
            signDictInfo: {
                name: 'Foxit JSPlugin SDK',
                reason: 'As a Signature Sample',
                location: 'Fuzhou',
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
    window.getSignatureInfo = async () => {
        $('#signatureInfo').hide();
        myTable.destroy();
        doc = await app.getActiveDoc();
        if (doc === null) {
            console.log('doc is null');
            return;
        }
        const data = [];
        const sig = await Signature.create();
        let count = await sig.getDocSignatureCount(doc);
        console.log('getSignatureInfoByIndex: ', count);
        for (let i = 0; i < count; i++) {
            let info = await sig.getSignatureInfoByIndex(doc, i);
            if (info) {
                console.log('SignatureBaseInfo: ', info);
                // @ts-ignore
                let verifyState = info.verifyState;
                data.push({
                    signatureName: info.signatureName,
                    signedAuthorName: info.signedAuthorName,
                    signedCertName: info.signedCertName,
                    signedField: info.signedField,
                    signedLocation: info.signedLocation,
                    signedPageIndex: info.signedPageIndex,
                    signedReason: info.signedReason,
                    signedTime: info.signedTime,
                    verified: verifyState & DefineConst.FR_SIG_VERIFY_VALID ? 'valid' : 'invalid'
                });
            } else {
                console.log('getSignatureInfoByIndex failed');
            }
        }
        myTable = $('#myTable').DataTable({
            paging: false,
            searching: false,
            scrollX: true,
            ordering:  false,
            info: false,
            columns: [
                { data: 'signatureName' },
                { data: 'signedAuthorName' },
                { data: 'signedCertName' },
                { data: 'signedField' },
                { data: 'signedLocation' },
                { data: 'signedPageIndex' },
                { data: 'signedReason' },
                { data: 'signedTime' },
                { data: 'verified' }
            ],
            data: data
        });
    }
    window.clearSignature = async () => {
        const signatureName = $('#signatureName').val();
        if (
            signatureName === ''
            || signatureName === undefined
            || signatureName === null) {
            console.log('signatureName is empty');
            return;
        }
        doc = await app.getActiveDoc();
        if (doc === null) {
            console.log('doc is null');
            return;
        }
        const sig = await Signature.create();
        let clear = await sig.clearSignatureByName(doc, signatureName);
        let info = '';
        if (clear) {
            console.log('clearSignatureByName success');
            info = 'success';
        } else {
            console.log('clearSignatureByName failed');
            info = 'failed';
        }
        $('#signatureNameInfo').html(info);
        $('#signatureInfo').show();
    }
}
