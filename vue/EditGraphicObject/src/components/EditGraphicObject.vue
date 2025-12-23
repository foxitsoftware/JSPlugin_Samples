<script setup lang="ts">
import _ from 'lodash';
import {
    onMounted,
    onUnmounted,
    getCurrentInstance,
    ref,
    computed
} from 'vue';


import {
PageEditor,
TextObjectUtils,
DefineConst,
Enum,
GraphicObjectUtils,
// @ts-ignore
} from 'fx-jspluginsdk';


const { proxy }: any = getCurrentInstance();
const app = (proxy as { $pluginApp: any }).$pluginApp;

//全局变量
let pageEditor: PageEditor;
let graphicObjectUtils: GraphicObjectUtils;
let textObjectUtils: TextObjectUtils;
const selectedEditType = ref('Edit Object');
const currentObjectType = ref<string>('');
// 操作状态标志
let isApplyingProperty = false;

// 编辑类型选择框的选项
const editTypeOptions = [
    { label: 'Edit Object', value: 'Edit Object' },
    { label: 'Edit All', value: 'all' },
    { label: 'Edit Text', value: 'text' },
    { label: 'Edit Path', value: 'path' },
    { label: 'Edit Image', value: 'image' }
];
//通用属性
interface CommonPropertiesType {
    width: number;
    height: number;
    opacity: number;
    rotation: number;
    x: number;
    y: number;
}

const commonProperties = ref<CommonPropertiesType>({
    width: 0,
    height: 0,
    opacity: 0,
    rotation: 0,
    x: 0,
    y: 0
});

// 文本对象特有属性
interface TextPropertiesType {
    fontFamily: string;
    fontSize: number;
    color: string;
    isBold: boolean;
    isItalic: boolean;
}

const textProperties = ref<TextPropertiesType>({
    fontFamily: 'Arial',
    fontSize: 16,
    color: '#000000',
    isBold: false,
    isItalic: false,
});

// 字体选项
const fontFamilyOptions = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Georgia', value: 'Georgia' }
];

// 处理属性变化事件 - 使用正确的类型
const handlePropertyChange = async (property: keyof CommonPropertiesType, value: number) => {
    // 更新本地状态
    commonProperties.value[property] = value;
    // 立即应用单个属性
    await applySingleProperty(property, value);
};

const handleWidthChange = async (value: number | null) => {
    if (value === null) return;
    await handlePropertyChange('width', value);
};

const handleHeightChange = async (value: number | null) => {
    if (value === null) return;
    await handlePropertyChange('height', value);
};

const handleXPositionChange = async (value: number | null) => {
    if (value === null) return;
    await handlePropertyChange('x', value);
};

const handleYPositionChange = async (value: number | null) => {
    if (value === null) return;
    await handlePropertyChange('y', value);
};

const handleOpacityChange = async (value: number | null) => {
    if (value === null) return;
    await handlePropertyChange('opacity', value);
};

const applySingleProperty = async (property: string, value: number) => {
    if (pageEditor) {
        isApplyingProperty = true;
        console.log(`应用属性 ${property}: ${value}`);
        graphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
        if (_.isEmpty(graphicObjectUtils)) {
            console.error('graphicObjectUtils is null');
            isApplyingProperty = false;
            return;
        }

        try {
            // 调用对应的异步SDK接口
            switch (property) {
                case 'width':
                    await graphicObjectUtils.setWidth(value);
                    break;
                case 'height':
                    await graphicObjectUtils.setHeight(value);
                    break;
                case 'opacity':
                    await graphicObjectUtils.setOpacity(value);
                    break;
                case 'rotation':
                    await graphicObjectUtils.rotate(value);
                    break;
                case 'x':
                    await graphicObjectUtils.setXPosition(value);
                    break;
                case 'y':
                    await graphicObjectUtils.setYPosition(value);
                    break;
                default:
                    console.warn(`未知属性: ${property}`);
            }
        } catch (error) {
            console.error(`设置属性 ${property} 失败:`, error);
        }
        isApplyingProperty = false;
    }
};

//文本属性变化的设置
const handleFontFamilyChange = async (value: string) => {
    textProperties.value.fontFamily = value;
    await applyTextProperty('fontFamily', value);
};

const handleFontSizeChange = async (value: number | null) => {
    if (value === null) return;
    textProperties.value.fontSize = value;
    await applyTextProperty('fontSize', value);
};

//HEX 颜色字符串转RGB数组
const hexToRgbArray = (hex: string): number[] => {
    // 默认黑色
    const defaultColor = [0, 0, 0];

    if (!hex || typeof hex !== 'string') {
        console.warn('Invalid color input:', hex);
        return defaultColor;
    }

    // 移除 # 号并转为大写
    hex = hex.replace(/^#/, '').toUpperCase();

    // 验证 HEX 格式
    if (!/^[0-9A-F]{3,6}$/i.test(hex)) {
        console.warn('Invalid HEX color format:', hex);
        return defaultColor;
    }

    try {
        // 处理 3 位 HEX
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        // 处理 6 位 HEX
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            // 验证转换结果
            if (isNaN(r) || isNaN(g) || isNaN(b)) {
                throw new Error('Invalid color values');
            }

            return [r, g, b];
        }
    } catch (error) {
        console.error('Color conversion error:', error);
    }

    return defaultColor;
};

//RGB数组转 HEX 颜色字符串
const rgbArrayToHex = (rgbArray: number[]): string => {
    if (!rgbArray || rgbArray.length < 3) {
        return '#000000'; // 默认黑色
    }
    const [r, g, b] = rgbArray;

    // 确保数值在 0-255 范围内
    const clamp = (value: number) => Math.max(0, Math.min(255, value));

    const hexR = clamp(r).toString(16).padStart(2, '0');
    const hexG = clamp(g).toString(16).padStart(2, '0');
    const hexB = clamp(b).toString(16).padStart(2, '0');

    return `#${hexR}${hexG}${hexB}`.toUpperCase();
};

// 分离的颜色状态
const displayedColor = ref('#000000'); // 显示的颜色
const actualColor = ref('#000000');    // 实际对象的颜色
const isColorDifferent = computed(() => displayedColor.value !== actualColor.value);

const handleColorPreview = (value: string) => {
    displayedColor.value = value; // 只更新显示颜色
};

const handleColorChange = async (value: string) => {
    displayedColor.value = value;
    actualColor.value = value;
 
    console.log('确认颜色更改:', value);
    const rgbArray = hexToRgbArray(value);
    await applyTextProperty('color', rgbArray);
};


// const handleColorPreview = (value: string) => {
//     textProperties.value.color = value;
//     console.log('颜色预览:', value);
// };

// const handleColorChange = async (value: string) => {
//     isApplyingProperty = true;
//     textProperties.value.color = value;
//     // 转换为 RGB 数组
//     const rgbArray = hexToRgbArray(value);
//     console.log(`颜色转换: ${value} -> RGB数组[${rgbArray.join(', ')}]`);

//     await applyTextProperty('color', rgbArray);
// };

// 应用文本属性
const applyTextProperty = async (property: string, value: any) => {
    if (pageEditor) {
        isApplyingProperty = true;
        graphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
        if (_.isEmpty(graphicObjectUtils)) {
            console.error('graphicObjectUtils is null');
            isApplyingProperty = false;
            return;
        }
        console.log(`应用文本属性 ${property}: ${value}`);
        try {
            switch (property) {
                case 'fontFamily':
                    await textObjectUtils.setFont({
                        graphicObjectUtils: graphicObjectUtils,
                        fontName: '宋体',
                        bold: true,
                        italic: false,
                        opType: Enum.FPD_FONTOPERATION.kName
                    });
                    break;
                case 'fontSize':
                    await textObjectUtils.setFontSize(graphicObjectUtils, value);
                    break;
                case 'color':
                    console.log('设置颜色 RGB 数组:', value);
                    await textObjectUtils.setFillInfo(graphicObjectUtils, true, value, true);
                    const colorInfo = await textObjectUtils.getFillInfo(graphicObjectUtils);
                    let colorArray = colorInfo.color;
                    console.log('设置完后获取的颜色值:', colorArray);
                    //textProperties.value.color = rgbArrayToHex(value);
                    break;
                case 'isBold':
                    // await graphicObjectUtils.setBold(value);
                    break;
                case 'isItalic':
                    // await graphicObjectUtils.setItalic(value);
                    break;
                // 移除了 textAlign, letterSpacing, lineHeight 的 case
                default:
                    console.warn(`未知文本属性: ${property}`);
            }
        } catch (error) {
            console.error(`设置文本属性 ${property} 失败:`, error);
        }
        isApplyingProperty = false;
    }
};


// 处理对象选择框变化
const handleEditTypeChange = async (value: string) => {
    if (!pageEditor) return;
    // 根据选择的类型执行不同的操作
    switch (value) {
        case 'text':
            await pageEditor.editActivatePageEditor(DefineConst.FPD_PAGEOBJ_TEXT);
            break;
        case 'path':
            await pageEditor.editActivatePageEditor(DefineConst.FPD_PAGEOBJ_PATH);
            break;
        case 'image':
            await pageEditor.editActivatePageEditor(DefineConst.FPD_PAGEOBJ_IMAGE);
            break;
        case 'all':
            await pageEditor.editActivatePageEditor(-1);
            break;
    }
};

// 轮询相关
let pollInterval: number | null = null;
const POLL_INTERVAL_MS = 1000; // 根据需求调整

// 检查 graphicObjectUtils 是否有效
const isGraphicObjectValid = (utils: any): boolean => {
    if (!utils) return false;
    // 检查内部结构
    if (utils.$graphicObjectUtils && utils.$graphicObjectUtils.value) {
        const innerValue = utils.$graphicObjectUtils.value;
        // 检查 value 是否为空
        return innerValue !== '' && innerValue.uuid !== '';
    }
    return false;
};

// 在组件的适当位置添加此函数
const updateFontFamilyOptions = async (fontName: string) => {
    // 检查字体是否已存在于选项中
    const existingOption = fontFamilyOptions.find(option => option.value === fontName);

    if (!existingOption) {
        // 如果不存在，则添加新选项
        fontFamilyOptions.push({
            label: fontName,
            value: fontName
        });
    }

    // 更新当前选中的字体
    textProperties.value.fontFamily = fontName;
};

// 获取选中对象属性
const getSelectedObjectProperties = async () => {
    if (!pageEditor) return;
    if (isApplyingProperty) {
        console.log('正在应用属性，跳过本次轮询');
        return;
    }

    try {
        const currentGraphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
        if (isGraphicObjectValid(currentGraphicObjectUtils) === false) {
            currentObjectType.value = 'Other';
            commonProperties.value.width = 0;
            commonProperties.value.height = 0;
            commonProperties.value.opacity = 0;
            commonProperties.value.x = 0;
            commonProperties.value.y = 0;
            return;
        }
        graphicObjectUtils = currentGraphicObjectUtils;

        const objectType = await graphicObjectUtils.getType();

        if (objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kText) {
            currentObjectType.value = 'Text';
            const fontSize = await textObjectUtils.getFontSize(graphicObjectUtils);
            const fontName = await textObjectUtils.getFont(graphicObjectUtils, true);
            console.log(`获取字体: ${fontName}, 字号: ${fontSize}`);
            // 更新字体选项和选中值
            if (fontName) {
                await updateFontFamilyOptions(fontName);
            }
            textProperties.value.fontSize = fontSize;
            // 只有当颜色没有差异时才更新实际颜色
            if (!isColorDifferent.value) {
                console.log('更新实际颜色，因为没有差异');
                const colorInfo = await textObjectUtils.getFillInfo(graphicObjectUtils);
                let colorArray = colorInfo.color;
                console.log('获取到的颜色数组:', colorArray);
                const newColor = rgbArrayToHex(colorArray);
                actualColor.value = newColor;
                displayedColor.value = newColor;
            }
        } else if (objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kPath) {
            currentObjectType.value = 'Path';
        } else if (objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kImage) {
            currentObjectType.value = 'Image';
        } else {
            currentObjectType.value = 'Other';
        }

        const width = await graphicObjectUtils.getWidth();
        const height = await graphicObjectUtils.getHeight();
        const opacity = await graphicObjectUtils.getOpacity();
        const x = await graphicObjectUtils.getXPosition();
        const y = await graphicObjectUtils.getYPosition();

        // 更新commonProperties
        commonProperties.value.width = width;
        commonProperties.value.height = height;
        commonProperties.value.opacity = opacity;
        commonProperties.value.x = x;
        commonProperties.value.y = y;
    } catch (error) {
        console.error('获取对象属性失败:', error);
    }
};

// 设置轮询
const startPolling = () => {
    pollInterval = window.setInterval(getSelectedObjectProperties, POLL_INTERVAL_MS);
};

// 停止轮询
const stopPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
};

const keyEventMessage = ref<string>('');

const registerSelectionHandler = async () => {
    if (!app) return;
    if (selectionHandler) {
        console.log('SelectionHandler 已经注册，无需重复注册');
        return;
    }

    const callbacks = {
        // @ts-ignore
        onSelectionKeyDown: (clientData: any, doc: any, curSelectData: any, keyInfoData: any) => {
            keyEventMessage.value = '';
            console.log('onSelectionKeyDown', keyInfoData);
            try {
                // 解析 JSON 字符串
                if (typeof keyInfoData === 'string') {
                    const keyData = JSON.parse(keyInfoData);
                    console.log('解析后的键盘数据:', keyData);

                    if (keyData && keyData.keyName) {
                        // 使用解析后的对象
                        const { fullName } = keyData;
                        keyEventMessage.value = `${fullName}`;
                        console.log('设置键盘消息成功:', keyEventMessage.value);
                    } else {
                        keyEventMessage.value = 'No key name in parsed data';
                    }
                } else {
                    keyEventMessage.value = ``;
                }
            } catch (error) {
                console.error('JSON 解析错误:', error);
                keyEventMessage.value = '';
            }
            return true;
        },
        // @ts-ignore
        onSelectionKeyUp: (clientData: any, doc: any, curSelectData: any, keyInfoData: any) => {
            //keyEventMessage.value = `KeyCode: ${keyInfoData.keyName}, CharCode: ${keyInfoData.fullName}`;
            keyEventMessage.value = '';
            console.log('onSelectionKeyUp', keyInfoData);
            try {
                // 解析 JSON 字符串
                if (typeof keyInfoData === 'string') {
                    const keyData = JSON.parse(keyInfoData);
                    console.log('解析后的键盘数据:', keyData);
                    if (keyData && keyData.keyName) {
                        // 使用解析后的对象
                        const { fullName } = keyData;
                        keyEventMessage.value = `${fullName}`;
                        console.log('设置键盘消息成功:', keyEventMessage.value);
                    } else {
                        keyEventMessage.value = 'No key name in parsed data';
                    }
                } else {
                    keyEventMessage.value = ``;
                }
            } catch (error) {
                console.error('JSON 解析错误:', error);
                keyEventMessage.value = '';
            }
            return true;
        }
    };
    selectionHandler = await app.registerSelectionHandler(callbacks);
    console.log('app.registerSelectionHandler: ', app, selectionHandler);
};

let selectionHandler: any = null;
// vue的生命周期, 在组件挂载完成后执行
onMounted(async () => {
    //确保每次刷新页面时，工具栏都切换到手型工具，清空之前选中的对象状态
    const tool = await app.getToolByName("Hand");
    const toolstate = await app.setActiveTool(tool, false);
    console.log('app.setActiveTool: ', app, toolstate);
    // 加载 Graphic Object 编辑插件
    let state = await app.loadGraphicObjectAddon();
    console.log('Graphic Object Addon Load State:', state);
    // 创建 PageEditor 实例
    pageEditor = await PageEditor.create();
    // 创建 TextObjectUtils 实例
    textObjectUtils = await TextObjectUtils.create();
    //注册选中处理器
    registerSelectionHandler();
    startPolling();
});

onUnmounted(() => {
    console.log('组件卸载，停止轮询');
    stopPolling();
});
</script>

<template>
    <div style="padding: 20px">
        <!-- 编辑类型选择 -->
        <div style="display: flex; align-items: center; margin-bottom: 20px">
            <span style="margin-right: 10px">Edit Type:</span>
            <n-select style="width: 200px" v-model:value="selectedEditType" :options="editTypeOptions"
                placeholder="Select Edit Type" @update:value="handleEditTypeChange" />
        </div>

        <n-card title="Common Property" style="margin-bottom: 10px" :header-style="{ fontSize: '12px' }">
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">Width:</span>
                    <n-input-number :value="commonProperties.width" :show-button="false"
                        @update:value="handleWidthChange" :min="0" :max="1000" size="small" style="font-size: 10px;" />
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">Height:</span>
                    <n-input-number :value="commonProperties.height" :show-button="false"
                        @update:value="handleHeightChange" :min="0" :max="1000" size="small" style="font-size: 10px;" />
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">X Pos:</span>
                    <n-input-number :value="commonProperties.x" @update:value="handleXPositionChange"
                        :show-button="false" :min="0" :max="1000" size="small" style="font-size: 10px;" />
                </div>

                <div style="display: flex; align-items: center;gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">Y Pos:</span>
                    <n-input-number :value="commonProperties.y" @update:value="handleYPositionChange"
                        :show-button="false" :min="0" :max="1000" size="small" style="font-size: 10px;" />
                </div>

                <div style="display: flex; align-items: center;gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">Opacity:</span>
                    <n-input-number :value="commonProperties.opacity" :show-button="false"
                        @update:value="handleOpacityChange" :min="0" :max="100" size="small" style="font-size: 10px;" />
                </div>

                <!-- <div style="display: flex; align-items: center;gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">Rotate:</span>
                    <n-input-number
                        :value="commonProperties.rotation"
                        :show-button="false"
                        @update:value="handleRotateChange"
                        :min="0"
                        :max="360"
                        size="small"
                        style="font-size: 10px;"
                    />
                </div> -->
            </div>
        </n-card>

        <!-- 文本属性 - 只在选中文本对象时显示 -->
        <n-card v-if="currentObjectType === 'Text'" title="Text Property" style="margin-bottom: 20px"
            :header-style="{ fontSize: '12px' }">
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <!-- 字体和字号 -->
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">Font Family:</span>
                    <n-select style="flex: 1; min-width: 120px;" :value="textProperties.fontFamily"
                        @update:value="handleFontFamilyChange" :options="fontFamilyOptions" placeholder="Select Font" />
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">Font Size:</span>
                    <n-input-number :value="textProperties.fontSize" :show-button="false"
                        @update:value="handleFontSizeChange" :min="8" :max="72" size="small" style="font-size: 10px;" />
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-size: 12px; color: #666; font-weight: 500;">Color:</span>
                    <n-color-picker :value="displayedColor" @update:value="handleColorPreview"
                        @confirm="handleColorChange" :modes="['hex']" :show-alpha="false" :actions="['confirm']"
                        :swatches="[
                            '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
                            '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500', '#800080',
                            '#008000', '#800000', '#008080', '#000080', '#808080'
                        ]" size="small" style="width: 120px;" />
                    <div :style="{
                        width: '24px',
                        height: '24px',
                        backgroundColor: displayedColor,
                        border: isColorDifferent ? '2px solid #ff6b35' : '1px solid #ddd',
                        borderRadius: '4px'
                    }" :title="isColorDifferent ? '颜色已修改，等待确认' : ''">
                    </div>
                    <span v-if="isColorDifferent" style="color: #ff6b35; font-size: 10px;">
                        未确认
                    </span>
                </div>
            </div>
        </n-card>

        <!-- 加一个控件显示selection keydown ,up的按键的信息 -->
        <n-card title="Key Events Message" style="margin-bottom: 20px" :header-style="{ fontSize: '12px' }">
            <div style="display: flex; align-items: center; gap: 8px; min-height: 32px;">
                <span style="font-size: 12px; color: #666; min-width: 60px;">Current Enter Key:</span>
                <n-tag v-if="keyEventMessage" size="small" type="info">
                    {{ keyEventMessage }}
                </n-tag>
                <span v-else style="color: #999; font-size: 12px;">
                    No key pressed
                </span>
                <!-- <n-button size="small" @click="clearMessage" type="primary" text style="margin-left: auto;">
                    Clear
                </n-button> -->
            </div>
        </n-card>

        <!-- <n-button @click="registerMenuHandler">Register Menu SelectionHandler</n-button> -->
    </div>
</template>