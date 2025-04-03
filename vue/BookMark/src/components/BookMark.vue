<script setup lang="ts">
import _ from 'lodash';
import {
    onMounted,
    getCurrentInstance,
    // ref
} from 'vue';

import {
    BookmarkPanel
    // @ts-ignore
} from 'fx-jspluginsdk';

const { proxy }: any = getCurrentInstance();
const app = (proxy as { $pluginApp: any }).$pluginApp;
let doc;
let book_01: any = null;
let book_02: any = null;
let book_03: any = null;
let book_02_01 = null;
const addBookMark = async () => {
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

const insertBookMark = async () => {
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

const moveBookMark = async()=>{
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

const deleteBookMark = async () => {
    doc = await app.getActiveDoc();
    if (
        doc === null
    ) {
        return;
    }
    const bookmarkPanel = await BookmarkPanel.create();
    await bookmarkPanel.deleteBookMark(doc, book_02);
}

// vue的生命周期, 在组件挂载完成后执行
// vue的生命周期, 在组件挂载完成后执行
onMounted(async () => {
    doc = await app.getActiveDoc();
});
</script>

<template>
    <div class="bookMark-content">
        <n-button class="bookMark-btn" @click="addBookMark">addBookMark</n-button>
        <n-button class="bookMark-btn" @click="insertBookMark">insertBookMark</n-button>
        <n-button class="bookMark-btn" @click="moveBookMark">moveBookMark</n-button>
        <n-button class="bookMark-btn" @click="deleteBookMark">deleteBookMark</n-button>
    </div>
</template>

<style scoped lang='less'>
.bookMark-content {
    text-align: left;
    .bookMark-btn {
        margin-top: 10px;
        margin-left: 10px;
    }
}
</style>
