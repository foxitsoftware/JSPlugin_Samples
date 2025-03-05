<script setup lang="ts">
import _ from 'lodash';
import {
    onMounted,
    getCurrentInstance,
    ref
} from 'vue';

import {
    Doc,
    DefineConst
// @ts-ignore
} from 'fx-jspluginsdk';

const { proxy }: any = getCurrentInstance();
const app = (proxy as { $pluginApp: any }).$pluginApp;
let doc: Doc | null = null;
let curPage = ref(0);
let pageCount = ref(0);
let docPermission = ref();
let bExtract = ref(true);
let bPrint = ref(true);

const nextPage = async () => {
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

const previousPage = async () => {
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

const printDoc = async () => {
    console.log('print doc');
    doc = await app.getActiveDoc();
    if(doc === null) {
        throw new Error('no active doc');
        return
    }
    const permiss = ref();
    permiss.value = await doc.getPermissions();
    if ((permiss.value & DefineConst.FPD_PERM_PRINT) === 0)
    {
        console.log('No Print Permission');
        return;
    }
    await doc.doPrint();
}

const closeDoc = async () => {
    console.log('save doc');
    doc = await app.getActiveDoc();
    if(doc === null) {
        throw new Error('no active doc');
        return
    }
    await doc.close();
}

const saveDoc = async () => {
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

// const insertPages = async () => {
//     console.log('insert page');
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

// const replacePages = async () => {
//     console.log('replace page');
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

const extractPages = async () => {
    console.log('extract page');
    doc = await app.getActiveDoc();
    if(doc === null) {
        throw new Error('no active doc');
        return
    }
    const permiss = ref();
    permiss.value = await doc.getPermissions();
    if ((permiss.value & DefineConst.FPD_PERM_EXTRACT) === 0)
    {
        console.log('No Extract Permission');
        return;
    }

    const ret = await doc.extractPages([0], './extract.pdf')
    if(ret)
        console.log('It has extracted first page to new file ');
}

// const convertDoc = async () => {
//     console.log('convert doc');
//     if(doc === null) {
//         throw new Error('no active doc');
//         return
//     }
//     const bRet = await doc.convertPdfToOtherFormat2('D:\\convert.docx', 'Word Document (*.docx)|*.docx')
//     if (bRet) {
//             console.log('Conver success')
//     } else{
//             console.log('Converfailed')
//     }
// }

const getDocPermission = async () => {
    console.log('get doc permission');
    doc = await app.getActiveDoc();
    if(doc === null) {
        throw new Error('no active doc');
        return
    }
    docPermission.value = await doc.getPermissions();
    console.log('permission:', docPermission.value);
    if ((docPermission.value & DefineConst.FPD_PERM_PRINT) === 0)
        console.log('No Print Permission');

    if ((docPermission.value & DefineConst.FPD_PERM_MODIFY) === 0)
        console.log('No Modify Permission');

    if ((docPermission.value & DefineConst.FPD_PERM_EXTRACT) === 0)
        console.log('No Extract Permission');

    if ((docPermission.value & DefineConst.FPD_PERM_ANNOT_FORM) === 0)
        console.log('No Annotation Permission');
}

const updatePageInfo = async () => {
    const curPageIndex = await doc.getCurrentPageIndex();
    curPage.value = curPageIndex + 1;
    console.log('curPage: ', curPage.value);
    pageCount.value = await doc.getPageCount();
}

const registerDocHandler = async () => {
    const docEventCallbacks = {
        onActivate: async (clientData: any, pdDoc: any) => {
            console.log("onDocActivate", clientData, pdDoc);
            //doc = await app.getActiveDoc();
            //await updatePageInfo();
            if (pdDoc) {
                doc = pdDoc;

                //const permission = await doc.getPermissions();
                const permiss = ref();
                permiss.value = await doc.getPermissions();
                if ((permiss.value & DefineConst.FPD_PERM_EXTRACT) === 0)
                {
                    bExtract.value = false;
                    console.log('No Extract Permission');
                }
                else
                {
                    bExtract.value= true;
                    console.log('Has Extract Permission');
                }

                if ((permiss.value & DefineConst.FPD_PERM_PRINT) === 0)
                {
                    bPrint.value = false;
                    console.log('No Print Permission');
                }
                else
                {
                    bPrint.value= true;
                    console.log('Has Print Permission');
                }

                let docView = await doc.getCurrentDocView();
                if (docView === null) {
                    throw new Error('docView is null');
                }
                const curPageIndex = await doc.getCurrentPageIndex();
                await docView.gotoPageView(curPageIndex);
                await updatePageInfo();
            } else {
                throw new Error('Doc is null');
            }
        }
    };
    const bRet = await app.registerDocHandlerOfPDDoc(docEventCallbacks);
    console.log('app.registerDocHandlerOfPDDoc: ', bRet);
}

// vue的生命周期, 在组件挂载完成后执行
onMounted(async () => {
    console.log('onMounted');
    registerDocHandler();
    doc = await app.getActiveDoc();
    await updatePageInfo();
});
</script>

<template>
    <div style="margin-bottom: 12px;">
        <n-button style="margin-top: 10px" @click='previousPage' :disabled="curPage === 1">Previous Page</n-button>
        <span>{{ curPage }} / {{ pageCount }}&nbsp;&nbsp;</span>
        <n-button style="margin-top: 10px" @click='nextPage' :disabled="curPage === pageCount">Next Page</n-button>
    </div>
    <n-button style="margin-top: 10px" @click='printDoc' :disabled="bPrint === false">Print Document</n-button>
    <n-button style="margin-top: 10px" @click='closeDoc'>Close Document</n-button>
    <!-- <n-button style="margin-top: 10px" @click='convertDoc'>Convert Document</n-button> -->
    <n-button style="margin-top: 10px" @click='saveDoc'>Save Document</n-button>
    <!-- <n-button style="margin-top: 10px" @click='insertPages'>Insert Pages</n-button> -->
    <!-- <n-button style="margin-top: 10px" @click='replacePages'>Replace Pages</n-button> -->
    <n-button style="margin-top: 10px" @click='extractPages' :disabled="bExtract === false">Extract Pages</n-button>
    <div>
        <n-button style="margin-top: 10px" @click='getDocPermission'>Doc Permission</n-button>
        <!-- <p>{{ docPermission }}</p>-->
        <div v-if="docPermission">
            <p>{{ (docPermission & DefineConst.FPD_PERM_PRINT) ? 'Has Print Permission' : 'No Print Permission' }}</p>
            <p>{{ (docPermission & DefineConst.FPD_PERM_MODIFY) ? 'Has Modify Permission' : 'No Modify Permission' }}</p>
            <p>{{ (docPermission & DefineConst.FPD_PERM_EXTRACT) ? 'Has Extract Permission' : 'No Extract Permission' }}</p>
            <p>{{ (docPermission & DefineConst.FPD_PERM_ANNOT_FORM) ? 'Has Annotation Permission' : 'No Annotation Permission' }}</p>
        </div>
    </div>
</template>
<style scoped lang='less'>
    button {
        margin-top: 10px;
    }
</style>
