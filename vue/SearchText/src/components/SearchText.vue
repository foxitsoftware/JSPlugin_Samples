<script setup lang="ts">
import _ from 'lodash';
import {
    onMounted,
    getCurrentInstance,
    ref
} from 'vue';

import {
    TextSelectTool,
    FloatRectArray,
    // TextPage
    // @ts-ignore
} from 'fx-jspluginsdk';

const { proxy }: any = getCurrentInstance();
const app = (proxy as { $pluginApp: any }).$pluginApp;
const text = ref('');
const rectArr = ref<FloatRectArray[]>([]);
const searchResultText = ref(''); // 搜索后的文本
const hasSearchResult = ref(true); // 是否有搜索结果
const lastSearchText = ref(''); // 上一次搜索的文本
const isDuplicateSearch = ref(false); // 是否是重复搜索
// let app: App;
const searchText = async () => {
    // rectArr.value = [];
    if (
        _.isEmpty(text.value)
    ) {
        hasSearchResult.value = false;
        rectArr.value = [];
        console.error('Please input text');
        return;

    }

    if (text.value === lastSearchText.value) {
        // 如果是重复搜索，直接返回并设置提示信息
        console.log('lastSearchText', lastSearchText.value);
        isDuplicateSearch.value = true;
        return;
    }

    isDuplicateSearch.value = false; // 重置重复搜索提示
    console.log('searchText', text.value);
    searchResultText.value = text.value;
    lastSearchText.value = text.value;
    console.log('searchResultText', searchResultText.value);
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
    // let bFind = await pageTextSearch.findFirst('长方形', 0, 0);
    let bFind = await pageTextSearch.findFirst(searchResultText.value, 0, 0);

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
        if (rectCount > 0) {
            await rectArray.append(rectArrayItem);
            rectArr.value.push(rectArrayItem);
        }
        bFind = await pageTextSearch.findNext();
    }
    let findRectSize = await rectArray.getSize();
    console.log('findRectSize', findRectSize, rectArray);
    if(findRectSize > 0){
        hasSearchResult.value = true;
    } else{
        hasSearchResult.value = false;
        console.log('Not found');
    }
}
const selectItem = async (index: number) => {
    let doc = await app.getActiveDoc();
    let docView = await doc.getCurrentDocView();
    let pageView = await docView.getCurrentPageView();
    let textSelectTool = await TextSelectTool.create({ doc });
    await textSelectTool.addSelect(pageView, rectArr.value[index]);
}

const registerDocHandler = async () => {
    const docEventCallbacks = {
        onActivate: async (clientData: any, pdDoc: any) => {
            console.log("onDocActivate", clientData, pdDoc);
            text.value ='';
            searchResultText.value = '';
            isDuplicateSearch.value = false;
            lastSearchText.value = '';
            rectArr.value = [];
        }
    };
    const bRet = await app.registerDocHandlerOfPDDoc(docEventCallbacks);
    console.log('app.registerDocHandlerOfPDDoc: ', bRet);
}

// vue的生命周期, 在组件挂载完成后执行
onMounted(() => {
    //app = new App();
    registerDocHandler();
});
</script>

<template>
    <div class="search-text-content">
        <n-input v-model:value="text" type="text" placeholder="Enter text to search" />
        <n-button class="search-btn" @click="searchText">SearchText</n-button>
        <div v-if="isDuplicateSearch" class="duplicate-search-message">
            Current content has been searched.
        </div>
        <n-list v-if="hasSearchResult" hoverable clickable>
            <n-list-item
                v-for="(item, index) in rectArr"
                :key="item"
                @click="selectItem(index)"
            >
                result{{index + 1}}: {{ searchResultText }}
            </n-list-item>
        </n-list>

        <div v-else class="no-result">
            No results found.
        </div>
    </div>
</template>

<style scoped lang='less'>
.search-text-content {
    text-align: left;
    .search-btn {
        margin-top: 10px;
    }
}
.no-result {
    margin-top: 16px;
    color: #888;
    font-style: italic;
}
</style>
