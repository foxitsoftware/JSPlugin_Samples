<script setup lang="ts">
import _ from 'lodash';
import {
    onMounted,
    onUnmounted,
    getCurrentInstance,
    ref,
    watch
} from 'vue';

import
{
    PageEditor,
    TextObjectUtils,
    DefineConst,
    Enum
} from 'fx-jspluginsdk';

import {
    NSelect,
    NCard,
    NButton,
    NInputNumber,
    NSlider,
    NColorPicker
} from 'naive-ui';

const { proxy }: any = getCurrentInstance();
const app = (proxy as { $pluginApp: any }).$pluginApp;

let pageEditor: PageEditorType | null;
let graphicObjectUtils: GraphicObjectUtilsType | null;
let textObjectUtils: TextObjectUtilsType | null;
// 编辑类型选择框的选项
const editTypeOptions = [
    { label: 'Edit Object', value: 'Edit Object' },
    { label: 'Edit All', value: 'all' },
    { label: 'Edit Text', value: 'text' },
    { label: 'Edit Path', value: 'path' },
    { label: 'Edit Image', value: 'image' }
];

// 当前选中的编辑类型
const selectedEditType = ref('Edit Object');
const currentObjectType = ref<string>('');

interface CommonPropertiesType {
    width: number;
    height: number;
    opacity: number;
    rotation: number;
    x: number;
    y: number;
}

const commonProperties = ref<CommonPropertiesType>({
    width: 100,
    height: 100,
    opacity: 100,
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

const handleRotateChange = async (value: number | null) => {
    if (value === null) return;
    await handlePropertyChange('rotation', value);
};

const applySingleProperty = async (property: string, value: number) => {
    if (pageEditor) {
        console.log(`应用属性 ${property}: ${value}`);
        graphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
        if (_.isEmpty(graphicObjectUtils)) {
            console.error('graphicObjectUtils is null');
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
    }
};

//文本属性变化的设置
const handleBoldChange = async (value: boolean) => {
    textProperties.value.isBold = value;
    await applyTextProperty('isBold', value);
};

const handleItalicChange = async (value: boolean) => {
    textProperties.value.isItalic = value;
    await applyTextProperty('isItalic', value);
};

const handleFontFamilyChange = async (value: string) => {
    textProperties.value.fontFamily = value;
    await applyTextProperty('fontFamily', value);
};

const handleFontSizeChange = async (value: number | null) => {
    if (value === null) return;
    textProperties.value.fontSize = value;
    await applyTextProperty('fontSize', value);
};

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

const handleColorChange = async (value: string) => {
    textProperties.value.color = value;
    // 转换为 RGB 数组
    const rgbArray = hexToRgbArray(value);
    console.log(`颜色转换: ${value} -> RGB数组[${rgbArray.join(', ')}]`);

    await applyTextProperty('color', rgbArray);
};

// 移除 handleTextAlignChange, handleLetterSpacingChange, handleLineHeightChange

// 应用文本属性
const applyTextProperty = async (property: string, value: any) => {
    if (pageEditor) {
        graphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
        if (_.isEmpty(graphicObjectUtils)) {
            console.error('graphicObjectUtils is null');
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
                    await textObjectUtils.setStrokeInfo(graphicObjectUtils, true, value,true);
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
    }
};


// 处理选择框变化
const handleEditTypeChange = (value: string) => {
    console.log('Selected edit type:', value);
    // 根据选择的类型执行不同的操作
    switch (value) {
        case 'text':
            editTextObject();
            break;
        case 'path':
            editPathObject();
            break;
        case 'image':
            editImageObject();
            break;
        case 'all':
            editAllObjects();
            break;
    }
};

// 编辑TextObject
const editTextObject = async () => {
    if (pageEditor) {
        await pageEditor.editActivatePageEditor(DefineConst.FPD_PAGEOBJ_TEXT);
    }
    console.log('Editing Text Object');
};

// 编辑PathObject
const editPathObject = async () => {
    if (pageEditor) {
        await pageEditor.editActivatePageEditor(DefineConst.FPD_PAGEOBJ_PATH);
    }
    console.log('Editing Path Object');
};

// 编辑ImageObject
const editImageObject = async () => {
    if (pageEditor) {
        await pageEditor.editActivatePageEditor(DefineConst.FPD_PAGEOBJ_IMAGE);
    }
    console.log('Editing Image Object');
};

// 编辑所有对象
const editAllObjects = async () => {
    if (pageEditor) {
        await pageEditor.editActivatePageEditor(-1);
    }
    console.log('Editing All Objects');
};

// 选中状态和属性
const selectedObject = ref<any>(null);
const isObjectSelected = ref(false);

// 轮询相关
let pollInterval: number | null = null;
const POLL_INTERVAL_MS = 500; // 根据需求调整

// 获取选中对象属性
const getSelectedObjectProperties = async () => {
  if (!pageEditor) return;

  try {
    //const currentSelection = await pageEditor.getSelection();
    graphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
    console.log('graphicObjectUtils', graphicObjectUtils);
    // 选中状态发生变化时
    if (_.isEmpty(graphicObjectUtils)) {
        console.log('没有选中对象');
        return;
    }

    if (_.isEmpty(graphicObjectUtils) === false) {
        const objectType = await graphicObjectUtils.getType();

        if(objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kText){
            currentObjectType.value = 'Text';
        } else if(objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kPath){
            currentObjectType.value = 'Path';
        } else if(objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kImage){
            currentObjectType.value = 'Image';
        } else {
            currentObjectType.value = 'Other';
        }

        isObjectSelected.value = true;
        const width = await graphicObjectUtils.getWidth();
        const height = await graphicObjectUtils.getHeight();
        const opacity = await graphicObjectUtils.getOpacity();
        const x = await graphicObjectUtils.getXPosition();
        const y = await graphicObjectUtils.getYPosition();
        //const rotate = await graphicObjectUtils.getRotation();
        // 更新commonProperties
        commonProperties.value.width = width;
        commonProperties.value.height = height;
        commonProperties.value.opacity = opacity;
        commonProperties.value.x = x;
        commonProperties.value.y = y;
        //commonProperties.value.rotation = rotate;
        console.log('获取对象属性:', commonProperties.value);
    } else if (isObjectSelected.value) {
      // 选择被清空
      isObjectSelected.value = false;
      selectedObject.value = null;
      currentObjectType.value = 'Other';
      //resetToDefaultProperties();

      commonProperties.value.width = 0;
      commonProperties.value.height = 0;
      commonProperties.value.opacity = 0;
      commonProperties.value.x = 0;
      commonProperties.value.y = 0;
    }
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

// vue的生命周期, 在组件挂载完成后执行
onMounted(async () => {
    let state = await app.loadGraphicObjectAddon();
    console.log('Graphic Object Addon Load State:', state);
    pageEditor = await PageEditor.create();
    textObjectUtils = await TextObjectUtils.create();
    startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
    <div style="padding: 20px">
        <!-- 编辑类型选择 -->
        <div style="display: flex; align-items: center; margin-bottom: 20px">
            <span style="margin-right: 10px">Edit Type:</span>
            <n-select
                style="width: 200px"
                v-model:value="selectedEditType"
                :options="editTypeOptions"
                placeholder="Select Edit Type"
                @update:value="handleEditTypeChange"
            />
        </div>

        <n-card title="" style="margin-bottom: 20px">
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 80px; font-weight: bold;">Width:</span>
                    <n-input-number
                        :value="commonProperties.width"
                        @update:value="handleWidthChange"
                        :min="1"
                        :max="1000"
                    />
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 80px; font-weight: bold;">Height:</span>
                    <n-input-number
                        :value="commonProperties.height"
                        @update:value="handleHeightChange"
                        :min="1"
                        :max="1000"
                    />
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 80px; font-weight: bold;">X Position:</span>
                    <n-input-number
                        :value="commonProperties.x"
                        @update:value="handleXPositionChange"
                        :min="0"
                        :max="1000"
                    />
                </div>

                <div style="display: flex; align-items: center;gap: 12px;">
                    <span style="width: 80px; font-weight: bold;">Y Position:</span>
                    <n-input-number
                        :value="commonProperties.x"
                        @update:value="handleYPositionChange"
                        :min="0"
                        :max="1000"
                    />
                </div>

                <div style="display: flex; align-items: center;gap: 12px;">
                    <span style="width: 80px; font-weight: bold;">Opacity:</span>
                    <n-input-number
                        :value="commonProperties.opacity"
                        @update:value="handleOpacityChange"
                        :min="0"
                        :max="100"
                    />
                </div>

                <div style="display: flex; align-items: center;gap: 12px;">
                    <span style="width: 80px; font-weight: bold;">Rotate:</span>
                    <n-input-number
                        :value="commonProperties.rotation"
                        @update:value="handleRotateChange"
                        :min="0"
                        :max="360"
                    />
                </div>
            </div>
        </n-card>

        <!-- 文本属性 - 只在选中文本对象时显示 -->
         <n-card v-if="currentObjectType === 'Text'" title="" style="margin-bottom: 20px">
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <!-- 字体和字号 -->
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-weight: bold;">Font Family:</span>
                    <n-select
                        style="flex: 1"
                        :value="textProperties.fontFamily"
                        @update:value="handleFontFamilyChange"
                        :options="fontFamilyOptions"
                        placeholder="Select Font"
                    />
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-weight: bold;">Font Size:</span>
                    <n-input-number
                        :value="textProperties.fontSize"
                        @update:value="handleFontSizeChange"
                        :min="8"
                        :max="72"
                    />
                </div>

                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-weight: bold;">Color:</span>
                    <n-color-picker
                        :value="textProperties.color"
                        @update:value="handleColorChange"
                        :modes="['hex']"
                        :show-alpha="false"
                        style="width: 120px;"
                    />
                    <span style="color: #666; font-size: 12px;">{{ textProperties.color }}</span>
                </div>

                 <!-- <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="width: 100px; font-weight: bold;">Font Style:</span>
                    <n-select
                        style="flex: 1"
                        :value="currentFontStyle"
                        @update:value="handleFontStyleChange"
                        :options="fontStyleOptions"
                        placeholder="Select Font Style"
                    />
                </div> -->

                <!-- 移除了 Text Align, Letter Spacing, Line Height 的相关控件 -->
            </div>
        </n-card>
    </div>
</template>