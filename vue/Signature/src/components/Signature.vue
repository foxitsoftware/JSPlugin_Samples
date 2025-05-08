<script setup lang="ts">
import _ from 'lodash';
import {
    onMounted,
    getCurrentInstance,
    ref
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
let signatureName = ref('');
const signatureData = ref<any[]>([]);
const clearSignatureInfo = ref<String>('');

const columns = ref([
    {
        title: 'signatureName',
        key: 'signatureName',
        width: 100,
    },
    {
        title: 'signedAuthorName',
        key: 'signedAuthorName',
        width: 100,
    },
    {
        title: 'signedCertName',
        key: 'signedCertName',
        width: 100,
    },
    {
        title: 'signedField',
        key: 'signedField',
        width: 100,
    },
    {
        title: 'signedLocation',
        key: 'signedLocation',
        width: 100,
    },
    {
        title: 'signedPageIndex',
        key: 'signedPageIndex',
        width: 100,
    },
    {
        title: 'signedReason',
        key: 'signedReason',
        width: 100,
    },
    {
        title: 'signedTime',
        key: 'signedTime',
        width: 100,
    }
]);
const signatureSign = async () => {
    clearSignatureInfo.value = '';
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
    let rightValue = leftValue + 150;
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

const getSignatureInfo = async () => {
    clearSignatureInfo.value = '';
    signatureData.value = [];
    doc = await app.getActiveDoc();
    if (doc === null) {
        console.log('doc is null');
        return;
    }
    const sig = await Signature.create();
    let count = await sig.getDocSignatureCount(doc);
    console.log('getDocSignatureCount: ', count);
    for (let i = 0; i < count; i++) {
        let info = await sig.getSignatureInfoByIndex(doc, i);
        if (info) {
            console.log('SignatureBaseInfo: ', info);
            signatureData.value.push({
                signatureName: info.signatureName,
                signedAuthorName: info.signedAuthorName,
                signedCertName: info.signedCertName,
                signedField: info.signedField,
                signedLocation: info.signedLocation,
                signedPageIndex: info.signedPageIndex,
                signedReason: info.signedReason,
                signedTime: info.signedTime
            });
        } else {
            console.log('getSignatureInfoByIndex failed');
        }
    }
}

const clearSignature = async () => {
    clearSignatureInfo.value = '';
    const _signatureName = signatureName.value;
    if (
        _signatureName === ''
        || _signatureName === undefined
        || _signatureName === null) {
        console.log('signatureName is empty');
        return;
    }
    doc = await app.getActiveDoc();
    if (doc === null) {
        console.log('doc is null');
        return;
    }
    const sig = await Signature.create();
    let clear = await sig.clearSignatureByName(doc, _signatureName);
    if (clear) {
        console.log('clearSignatureByName success');
        clearSignatureInfo.value = 'success';
    } else {
        console.log('clearSignatureByName failed');
        clearSignatureInfo.value = 'failed';
    }
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
        <n-button class="signature-btn" @click="getSignatureInfo">getSignatureInfo</n-button>
        <div class="signature-clear">
            <n-input
                clearable
                v-model:value="signatureName"
                title="请输入你要移除的signatureName，如：Signature_0"
                placeholder="请输入你要移除的signatureName，如：Signature_0"
                :style="{ width: '200px' }"
            ></n-input>
            <n-button class="signature-btn" :disabled="!signatureName" @click="clearSignature">clearSignature</n-button>
        </div>
        <p v-if="clearSignatureInfo !== ''">
            clearSignatureInfo: {{ clearSignatureInfo }}
        </p>
        <n-divider />
        <n-data-table
            :columns="columns"
            :data="signatureData"
            :bordered="true"
        >
            <template #empty>
                <div class="empty"></div>
            </template>
        </n-data-table>
    </div>
</template>

<style scoped lang='less'>
.signature-content {
    text-align: left;
    .signature-btn {
        margin-top: 10px;
        margin-left: 10px;
    }
    .signature-clear {
        display: flex;
        justify-content: center;
        align-items: baseline;
    }
}
</style>
