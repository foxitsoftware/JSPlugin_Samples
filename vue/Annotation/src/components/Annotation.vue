<script setup lang="ts">
import {
    onMounted,
    getCurrentInstance
} from 'vue';

const { proxy }: any = getCurrentInstance();
const app = (proxy as { $pluginApp: any }).$pluginApp;
import {
    PDFDictionary,
    PDFString,
    PDFArray
    // @ts-ignore
} from 'fx-jspluginsdk';

const createHighlightAnnot = async () => {
    let doc = await app.getActiveDoc();
    if (doc === null) {
        throw new Error('no active doc');
    }
    let docView = await doc.getCurrentDocView();
    if (docView === null) {
        throw new Error('docView is null');
    }
    let pageView = await docView.getCurrentPageView();
    console.log(pageView);
    const pageIndex = await pageView.getPageIndex();

    let fpdObject = await PDFDictionary.create();
    let fpdfstringAnnot = await PDFString.create({ "str": "Annot" });
    await fpdObject.addValue('Type', fpdfstringAnnot);
    let fpdfstringSubtype = await PDFString.create({ "str": "Highlight" });
    await fpdObject.addValue('Subtype', fpdfstringSubtype);

    let rectFirst = { left: 100, top: 500, right: 300, bottom: 300 };

    let quad = await PDFArray.create();
    await quad.addNumber(rectFirst.left);
    await quad.addNumber(rectFirst.top);
    await quad.addNumber(rectFirst.right);
    await quad.addNumber(rectFirst.top);
    await quad.addNumber(rectFirst.left);
    await quad.addNumber(rectFirst.bottom);
    await quad.addNumber(rectFirst.right);
    await quad.addNumber(rectFirst.bottom);
    await fpdObject.addValue('QuadPoints', quad);

    let quadColor = await PDFArray.create();
    await quadColor.addNumber(1);
    await quadColor.addNumber(0);
    await quadColor.addNumber(0);
    await fpdObject.addValue('C', quadColor);

    let fpdfstringPopout = await PDFString.create({ "str": "This is initial text" });
    await fpdObject.addValue('Contents', fpdfstringPopout);
    await fpdObject.setAtRect('Rect', rectFirst);
    await pageView.addAnnot(fpdObject, 0);
    doc.reloadPage(pageIndex);

}

const deleteHighlightAnnot = async () => {
    let doc = await app.getActiveDoc();
    if (doc === null) {
        throw new Error('no active doc');
    }
    let docView = await doc.getCurrentDocView();
    if (docView === null) {
        throw new Error('docView is null');
    }
    let pageView = await docView.getCurrentPageView();
    console.log(pageView);
    const pageIndex = await pageView.getPageIndex();
    let count = await pageView.getAnnotCount();
    
    while (count-- > 0) {
        let annot = await pageView.getAnnotByIndex(count);
        let type = await annot.getType();
        if (type === 'Highlight') {
            await pageView.deleteAnnot(annot);
        }
    }
    doc.reloadPage(pageIndex);
   
}

const modifyHightlightAnnot = async () => {
    let doc = await app.getActiveDoc();
    if (doc === null) {
        throw new Error('no active doc');
    }
    let docView = await doc.getCurrentDocView();
    if (docView === null) {
        throw new Error('docView is null');
    }
    let pageView = await docView.getCurrentPageView();
    const pageIndex = await pageView.getPageIndex();
    console.log(pageView);
    let count = await pageView.getAnnotCount();
    console.log(count);
    for (let i = 0; i < count; i++) {
        let annot = await pageView.getAnnotByIndex(i);
        let type = await annot.getType();
        if (type != 'Highlight')
            continue;
        let obj = await annot.getAnnotDict();
        let content = await obj.getString('Contents');
        if (content === 'This is initial text') {
            await obj.setAtString('Contents', 'This is modified text for the highlight annotation');
        }
    }
    doc.reloadPage(pageIndex);
}

// vue的生命周期, 在组件挂载完成后执行
onMounted(() => {
    // app = new App();
});
</script>

<template>
    <n-button style="margin-right: 10px" @click="createHighlightAnnot">Create</n-button>
    <n-button style="margin-right: 10px" @click="deleteHighlightAnnot">Delete</n-button>
    <n-button @click="modifyHightlightAnnot">Modify</n-button>
</template>

<style scoped lang='less'></style>

