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
const addBookmark = async () => {
    doc = await app.getActiveDoc();
    if (
        doc === null
    ) {
        return;
    }
    const bookmarkPanel = await BookmarkPanel.create();
    book_01 = await bookmarkPanel.addBookmark(doc, 'book_01');
    console.log('addBookmark', book_01);
    book_02 = await bookmarkPanel.addBookmark(doc, 'book_02');
    book_03 = await bookmarkPanel.addBookmark(doc, 'book_03');
}

const insertBookmark = async () => {
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

const moveBookmark = async()=>{
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

const deleteBookmark = async () => {
    doc = await app.getActiveDoc();
    if (
        doc === null
    ) {
        return;
    }
    const bookmarkPanel = await BookmarkPanel.create();
    await bookmarkPanel.deleteBookmark(doc, book_02);
}

const destination = async () => {
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
const color = async () => {
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
const title = async () => {
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
const fontStyle = async () => {
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

// vue的生命周期, 在组件挂载完成后执行
// vue的生命周期, 在组件挂载完成后执行
onMounted(async () => {
    doc = await app.getActiveDoc();
});
</script>

<template>
    <div class="bookMark-content">
        <n-button class="bookmark-btn" @click="addBookmark">addBookmark</n-button>
        <n-button class="bookmark-btn" @click="insertBookmark">insertBookmark</n-button>
        <n-button class="bookmark-btn" @click="moveBookmark">moveBookmark</n-button>
        <n-button class="bookmark-btn" @click="deleteBookmark">deleteBookmark</n-button>
        <n-button class="bookmark-btn" @click="destination">destination</n-button>
        <n-button class="bookmark-btn" @click="color">color</n-button>
        <n-button class="bookmark-btn" @click="title">title</n-button>
        <n-button class="bookmark-btn" @click="fontStyle">fontStyle</n-button>
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
