<script setup lang="ts">
import {
    onMounted,
    getCurrentInstance,
    computed,
    ref
} from 'vue';


import {
  // PDFNumber,
  RibbonElement,
  LPVOID
  // @ts-ignore
} from 'fx-jspluginsdk';

import _ from 'lodash';

const { proxy }: any = getCurrentInstance();
const app = (proxy as { $pluginApp: any }).$pluginApp;

//
// let app: App;
let btnElement: RibbonElement;
let btnDropElement: RibbonElement;
const addRibbonButton = async () => {
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
            onExecute: async (clientData: LPVOID) => {
                console.log('This is a button', clientData);
                //alert('This is a button');
            }
        };
        await btnElement.setExecuteProc(executeProc);
        await btnElement.setEnabled(true);
    }
    await ribbonBar.reCalcLayout(true);
}

const addRibbonDropButton = async () => {
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
            onExecute: async (clientData: LPVOID) => {
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
            onExecute: async (clientData: LPVOID) => {
                console.log("This is a drop button2", clientData);
                //alert('This is a drop button2');
            }
        };
        await subElement2.setExecuteProc(executeProc);
    }
    await ribbonBar.reCalcLayout(true);
}

// vue的生命周期, 在组件挂载完成后执行
onMounted(() => {
    //app = new App();
});

let flag = ref(true);
const setFlag = async () => {
    flag.value = !flag.value;
    if (_.isEmpty(btnElement)) {
        return;
    }
    await btnElement.setEnabled(flag.value);
    console.log(flag.value);
}
// 定义一个计算属性来根据 g_flag 的值动态生成按钮的标题
const buttonTitle = computed(() => (!flag.value ? 'Enabled' : 'Disabled'));
</script>

<template>
      <n-button style="margin-right: 10px;" @click="addRibbonButton">AddRibbonButton</n-button>
      <n-button style="margin-right: 10px;" @click="setFlag">{{ buttonTitle }}</n-button>
      <n-button style="margin-top: 10px;" @click="addRibbonDropButton">AddRibbonDropButton</n-button>
</template>

<style scoped lang='less'></style>
