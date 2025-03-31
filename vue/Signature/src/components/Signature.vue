<script setup lang="ts">
import _ from 'lodash';
import {
    onMounted,
    getCurrentInstance,
    // ref
} from 'vue';

import {
    Signature,
    DefineConst,
    Enum
    // @ts-ignore
} from 'fx-jspluginsdk';

const { proxy }: any = getCurrentInstance();
const app = (proxy as { $pluginApp: any }).$pluginApp;
let doc;
let docView;
// @ts-ignore
let pageView = null;
const signatureSign = async () => {
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
            date: '2025-03-28',
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

// vue的生命周期, 在组件挂载完成后执行
onMounted(async () => {
    doc = await app.getActiveDoc();
    if (doc) {
        docView = await doc.getCurrentDocView();
        if (docView) {
            pageView = await docView.getCurrentPageView();
        }
    }
});
</script>

<template>
    <div class="signature-content">
        <n-button class="signature-btn" @click="signatureSign">signatureSign</n-button>
    </div>
</template>

<style scoped lang='less'>
.signature-content {
    text-align: left;
    .signature-btn {
        margin-top: 10px;
    }
}
</style>
