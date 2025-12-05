window.onload = async () => {
    const {
        PluginApp,
        Doc,
        TextObject,
        TextState,
        ColorState,
        ColorSpace,
        PageEditor,
        TextObjectUtils,
        Enum,
        DefineConst
    } = window.Foxit;
    
    const app = await PluginApp.create({
        pluginInfo: {
            id: 'EditGraphicObject',
            name: 'EditGraphicObject',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });

    // ========== 全局变量 ==========
    let pageEditor;
    let graphicObjectUtils;
    let textObjectUtils;
    let selectionHandler = null;
    let pollInterval = null;
    const POLL_INTERVAL_MS = 1000;
    let isApplyingProperty = false;

    // ========== 状态管理 ==========
    const state = {
        selectedEditType: 'Edit Object',
        currentObjectType: '',
        commonProperties: {
            width: 0,
            height: 0,
            opacity: 0,
            rotation: 0,
            x: 0,
            y: 0
        },
        textProperties: {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#000000',
            displayedColor: '#000000',
            actualColor: '#000000'
        },
        fontFamilyOptions: [
            'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'
        ],
        keyEventMessage: ''
    };

    // ========== 工具函数 ==========
    function updateStatus(message) {
        const statusElement = document.getElementById('sdkStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    function hexToRgbArray(hex) {
        const defaultColor = [0, 0, 0];
        
        if (!hex || typeof hex !== 'string') {
            console.warn('Invalid color input:', hex);
            return defaultColor;
        }
        
        hex = hex.replace(/^#/, '').toUpperCase();
        
        if (!/^[0-9A-F]{3,6}$/i.test(hex)) {
            console.warn('Invalid HEX color format:', hex);
            return defaultColor;
        }
        
        try {
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }
            
            if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                
                if (isNaN(r) || isNaN(g) || isNaN(b)) {
                    throw new Error('Invalid color values');
                }
                
                return [r, g, b];
            }
        } catch (error) {
            console.error('Color conversion error:', error);
        }
        
        return defaultColor;
    }

    function rgbArrayToHex(rgbArray) {
        if (!rgbArray || rgbArray.length < 3) {
            return '#000000';
        }
        
        const [r, g, b] = rgbArray;
        const clamp = (value) => Math.max(0, Math.min(255, value));
        
        const hexR = clamp(r).toString(16).padStart(2, '0');
        const hexG = clamp(g).toString(16).padStart(2, '0');
        const hexB = clamp(b).toString(16).padStart(2, '0');
        
        return `#${hexR}${hexG}${hexB}`.toUpperCase();
    }

    function isGraphicObjectValid(utils) {
        if (!utils) return false;
        if (typeof utils === 'object' && utils !== null) {
            if (typeof utils.getType === 'function') {
                return true;
            }
        }
        return false;
    }

    function updateFontFamilyOptions(fontName) {
        const select = document.getElementById('fontFamilySelect');
        const options = Array.from(select.options).map(opt => opt.value);
        
        if (!options.includes(fontName)) {
            const option = document.createElement('option');
            option.value = fontName;
            option.textContent = fontName;
            select.appendChild(option);
            console.log('添加新字体选项:', fontName);
        }
        
        state.textProperties.fontFamily = fontName;
        select.value = fontName;
    }

    function updateCommonProperties(props) {
        const widthInput = document.getElementById('widthInput');
        if (widthInput && state.commonProperties.width !== props.width) {
            state.commonProperties.width = props.width;
            widthInput.value = props.width;
        }
        
        const heightInput = document.getElementById('heightInput');
        if (heightInput && state.commonProperties.height !== props.height) {
            state.commonProperties.height = props.height;
            heightInput.value = props.height;
        }
        
        const opacityInput = document.getElementById('opacityInput');
        if (opacityInput && state.commonProperties.opacity !== props.opacity) {
            state.commonProperties.opacity = props.opacity;
            opacityInput.value = props.opacity;
        }
        
        const xInput = document.getElementById('xInput');
        if (xInput && state.commonProperties.x !== props.x) {
            state.commonProperties.x = props.x;
            xInput.value = props.x;
        }
        
        const yInput = document.getElementById('yInput');
        if (yInput && state.commonProperties.y !== props.y) {
            state.commonProperties.y = props.y;
            yInput.value = props.y;
        }
    }

    function showTextProperties() {
        const section = document.getElementById('textPropertiesSection');
        if (section) {
            section.classList.remove('hidden');
        }
    }

    function hideTextProperties() {
        const section = document.getElementById('textPropertiesSection');
        if (section) {
            section.classList.add('hidden');
        }
    }

    // ========== 应用属性函数 ==========
    async function applySingleProperty(property, value) {
        if (!pageEditor) {
            console.error('pageEditor 未初始化');
            alert('SDK 未初始化完成');
            return;
        }
        
        if (isApplyingProperty) {
            console.log('正在应用属性，跳过');
            return;
        }
        
        isApplyingProperty = true;
        console.log(`应用属性 ${property}: ${value}`);
        
        try {
            graphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
            if (!graphicObjectUtils) {
                console.error('graphicObjectUtils is null');
                alert('请先选择一个对象');
                isApplyingProperty = false;
                return;
            }

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
            console.log(`属性 ${property} 设置成功`);
        } catch (error) {
            console.error(`设置属性 ${property} 失败:`, error);
            alert('设置属性失败: ' + error.message);
        }
        
        isApplyingProperty = false;
    }

    async function applyTextProperty(property, value) {
        if (!pageEditor) {
            console.error('pageEditor 未初始化');
            alert('SDK 未初始化完成');
            return;
        }
        
        if (isApplyingProperty) {
            console.log('正在应用属性，跳过');
            return;
        }
        
        isApplyingProperty = true;
        console.log(`应用文本属性 ${property}:`, value);
        
        try {
            graphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
            if (!graphicObjectUtils) {
                console.error('graphicObjectUtils is null');
                alert('请先选择一个文本对象');
                isApplyingProperty = false;
                return;
            }
            
            switch (property) {
                case 'fontFamily':
                    await textObjectUtils.setFont({
                        graphicObjectUtils: graphicObjectUtils,
                        fontName: value,
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
                    console.log('设置完后获取的颜色值:', colorInfo.color);
                    break;
                default:
                    console.warn(`未知文本属性: ${property}`);
            }
            console.log(`文本属性 ${property} 设置成功`);
        } catch (error) {
            console.error(`设置文本属性 ${property} 失败:`, error);
            alert('设置文本属性失败: ' + error.message);
        }
        
        isApplyingProperty = false;
    }

    // ========== 按钮点击处理函数 ==========
    async function handleWidthApply() {
        const input = document.getElementById('widthInput');
        if (!input) return;
        
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            console.log('宽度输入无效');
            alert('请输入有效的数字');
            return;
        }
        
        console.log('应用宽度:', value);
        await applySingleProperty('width', value);
    }

    async function handleHeightApply() {
        const input = document.getElementById('heightInput');
        if (!input) return;
        
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            console.log('高度输入无效');
            alert('请输入有效的数字');
            return;
        }
        
        console.log('应用高度:', value);
        await applySingleProperty('height', value);
    }

    async function handleXApply() {
        const input = document.getElementById('xInput');
        if (!input) return;
        
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            console.log('X位置输入无效');
            alert('请输入有效的数字');
            return;
        }
        
        console.log('应用X位置:', value);
        await applySingleProperty('x', value);
    }

    async function handleYApply() {
        const input = document.getElementById('yInput');
        if (!input) return;
        
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            console.log('Y位置输入无效');
            alert('请输入有效的数字');
            return;
        }
        
        console.log('应用Y位置:', value);
        await applySingleProperty('y', value);
    }

    async function handleOpacityApply() {
        const input = document.getElementById('opacityInput');
        if (!input) return;
        
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            console.log('透明度输入无效');
            alert('请输入有效的数字');
            return;
        }
        
        const clampedValue = Math.max(0, Math.min(100, value));
        if (value !== clampedValue) {
            input.value = clampedValue;
        }
        
        console.log('应用透明度:', clampedValue);
        await applySingleProperty('opacity', clampedValue);
    }

    async function handleFontFamilyApply() {
        const select = document.getElementById('fontFamilySelect');
        if (!select) return;
        
        const value = select.value;
        console.log('应用字体家族:', value);
        
        await applyTextProperty('fontFamily', value);
    }

    async function handleFontSizeApply() {
        const input = document.getElementById('fontSizeInput');
        if (!input) return;
        
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            console.log('字体大小输入无效');
            alert('请输入有效的数字');
            return;
        }
        
        const clampedValue = Math.max(8, Math.min(72, value));
        if (value !== clampedValue) {
            input.value = clampedValue;
        }
        
        console.log('应用字体大小:', clampedValue);
        await applyTextProperty('fontSize', clampedValue);
    }

    function handleColorPreview(value) {
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        
        state.textProperties.displayedColor = value;
        console.log('颜色预览:', value);
        
        const colorInput = document.getElementById('colorInput');
        const colorTextInput = document.getElementById('colorTextInput');
        const colorPreview = document.getElementById('colorPreview');
        const colorModifiedText = document.getElementById('colorModifiedText');
        
        if (colorInput) colorInput.value = value;
        if (colorTextInput) colorTextInput.value = value;
        if (colorPreview) colorPreview.style.backgroundColor = value;
        
        if (value !== state.textProperties.actualColor) {
            if (colorModifiedText) colorModifiedText.classList.remove('hidden');
            if (colorPreview) colorPreview.classList.add('modified');
        }
    }

    async function handleColorApply() {
        const colorTextInput = document.getElementById('colorTextInput');
        if (!colorTextInput) return;
        
        let value = colorTextInput.value;
        console.log('应用颜色:', value);
        
        if (!value.startsWith('#')) {
            value = '#' + value;
            colorTextInput.value = value;
        }
        
        state.textProperties.displayedColor = value;
        state.textProperties.actualColor = value;
        
        const colorInput = document.getElementById('colorInput');
        const colorPreview = document.getElementById('colorPreview');
        const colorModifiedText = document.getElementById('colorModifiedText');
        
        if (colorInput) colorInput.value = value;
        if (colorPreview) {
            colorPreview.style.backgroundColor = value;
            colorPreview.classList.remove('modified');
        }
        if (colorModifiedText) colorModifiedText.classList.add('hidden');
        
        const rgbArray = hexToRgbArray(value);
        console.log('应用颜色 RGB:', rgbArray);
        await applyTextProperty('color', rgbArray);
    }

    async function handleEditTypeChange(value) {
        state.selectedEditType = value;
        console.log('处理编辑类型变化:', value);
        
        if (!pageEditor) {
            console.error('pageEditor 未初始化');
            return;
        }
        
        try {
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
            console.log('编辑类型已激活:', value);
        } catch (error) {
            console.error('激活编辑类型失败:', error);
        }
    }

    // ========== 其他功能函数 ==========
    async function getSelectedObjectProperties() {
        if (!pageEditor) {
            console.log('pageEditor 未初始化，跳过轮询');
            return;
        }
        
        if (isApplyingProperty) {
            console.log('正在应用属性，跳过本次轮询');
            return;
        }
        
        try {
            const currentGraphicObjectUtils = await pageEditor.editGetSelectedGraphObjectUtils();
            
            if (!isGraphicObjectValid(currentGraphicObjectUtils)) {
                console.log('没有选中有效对象');
                state.currentObjectType = '';
                const currentObjectTypeElement = document.getElementById('currentObjectType');
                if (currentObjectTypeElement) {
                    currentObjectTypeElement.textContent = '未选择对象';
                }
                updateCommonProperties({ width: 0, height: 0, opacity: 0, x: 0, y: 0 });
                hideTextProperties();
                return;
            }
            
            graphicObjectUtils = currentGraphicObjectUtils;
            const objectType = await graphicObjectUtils.getType();
            
            let objectTypeText = '未知对象';
            const currentObjectTypeElement = document.getElementById('currentObjectType');
            
            if (objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kText) {
                objectTypeText = '文本对象';
                state.currentObjectType = 'Text';
                showTextProperties();
                
                const fontSize = await textObjectUtils.getFontSize(graphicObjectUtils);
                const fontName = await textObjectUtils.getFont(graphicObjectUtils, true);
                
                console.log(`获取字体: ${fontName}, 字号: ${fontSize}`);
                
                if (fontName) {
                    updateFontFamilyOptions(fontName);
                }
                
                state.textProperties.fontSize = fontSize;
                const fontSizeInput = document.getElementById('fontSizeInput');
                if (fontSizeInput) fontSizeInput.value = fontSize;
                
                try {
                    const colorInfo = await textObjectUtils.getFillInfo(graphicObjectUtils);
                    const colorArray = colorInfo.color;
                    const newColor = rgbArrayToHex(colorArray);
                    console.log('获取到的颜色:', newColor);
                    
                    if (state.textProperties.displayedColor === state.textProperties.actualColor) {
                        state.textProperties.actualColor = newColor;
                        state.textProperties.displayedColor = newColor;
                        
                        const colorInput = document.getElementById('colorInput');
                        const colorTextInput = document.getElementById('colorTextInput');
                        const colorPreview = document.getElementById('colorPreview');
                        const colorModifiedText = document.getElementById('colorModifiedText');
                        
                        if (colorInput) colorInput.value = newColor;
                        if (colorTextInput) colorTextInput.value = newColor;
                        if (colorPreview) {
                            colorPreview.style.backgroundColor = newColor;
                            colorPreview.classList.remove('modified');
                        }
                        if (colorModifiedText) colorModifiedText.classList.add('hidden');
                    }
                } catch (colorError) {
                    console.warn('获取颜色失败:', colorError);
                }
                
            } else if (objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kPath) {
                objectTypeText = '路径对象';
                state.currentObjectType = 'Path';
                hideTextProperties();
            } else if (objectType === Enum.FPD_GraphicObjectUtilsType.FSGraphicUtilsType_kImage) {
                objectTypeText = '图片对象';
                state.currentObjectType = 'Image';
                hideTextProperties();
            } else {
                objectTypeText = '其他对象';
                state.currentObjectType = 'Other';
                hideTextProperties();
            }
            
            if (currentObjectTypeElement) {
                currentObjectTypeElement.textContent = objectTypeText;
            }
            
            const width = await graphicObjectUtils.getWidth();
            const height = await graphicObjectUtils.getHeight();
            const opacity = await graphicObjectUtils.getOpacity();
            const x = await graphicObjectUtils.getXPosition();
            const y = await graphicObjectUtils.getYPosition();
            
            console.log('通用属性:', { width, height, opacity, x, y });
            updateCommonProperties({ width, height, opacity, x, y });
            
        } catch (error) {
            console.error('获取对象属性失败:', error);
        }
    }

    function updateKeyEventMessage(keyInfoData, eventType) {
        try {
            if (typeof keyInfoData === 'string') {
                const keyData = JSON.parse(keyInfoData);
                if (keyData && keyData.fullName) {
                    state.keyEventMessage = keyData.fullName;
                    const element = document.getElementById('keyEventMessage');
                    if (element) {
                        element.textContent = state.keyEventMessage;
                        element.className = 'key-event-tag';
                    }
                }
            }
        } catch (error) {
            console.error('JSON 解析错误:', error);
            state.keyEventMessage = '';
            const element = document.getElementById('keyEventMessage');
            if (element) {
                element.textContent = 'No key pressed';
                element.className = 'no-key';
            }
        }
        
        if (eventType === 'keyup') {
            setTimeout(() => {
                state.keyEventMessage = '';
                const element = document.getElementById('keyEventMessage');
                if (element) {
                    element.textContent = 'No key pressed';
                    element.className = 'no-key';
                }
            }, 500);
        }
    }

    async function registerSelectionHandler() {
        if (!app) {
            console.error('app 未初始化');
            return;
        }
        
        if (selectionHandler) {
            console.log('SelectionHandler 已经注册，无需重复注册');
            return;
        }
        
        try {
            const callbacks = {
                onSelectionKeyDown: (clientData, doc, curSelectData, keyInfoData) => {
                    console.log('onSelectionKeyDown:', keyInfoData);
                    updateKeyEventMessage(keyInfoData, 'keydown');
                    return true;
                },
                onSelectionKeyUp: (clientData, doc, curSelectData, keyInfoData) => {
                    console.log('onSelectionKeyUp:', keyInfoData);
                    updateKeyEventMessage(keyInfoData, 'keyup');
                    return true;
                }
            };
            
            selectionHandler = await app.registerSelectionHandlerJs(callbacks);
            console.log('SelectionHandler 注册成功');
        } catch (error) {
            console.error('注册 SelectionHandler 失败:', error);
        }
    }

    function startPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
        }
        pollInterval = setInterval(getSelectedObjectProperties, POLL_INTERVAL_MS);
        console.log('轮询已启动，间隔:', POLL_INTERVAL_MS, 'ms');
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
            console.log('轮询已停止');
        }
    }

    // ========== 事件监听器初始化 ==========
    function initEventListeners() {
        console.log('初始化事件监听器...');
        
        // 按钮事件
        const widthBtn = document.getElementById('widthBtn');
        if (widthBtn) widthBtn.addEventListener('click', handleWidthApply);
        
        const heightBtn = document.getElementById('heightBtn');
        if (heightBtn) heightBtn.addEventListener('click', handleHeightApply);
        
        const xBtn = document.getElementById('xBtn');
        if (xBtn) xBtn.addEventListener('click', handleXApply);
        
        const yBtn = document.getElementById('yBtn');
        if (yBtn) yBtn.addEventListener('click', handleYApply);
        
        const opacityBtn = document.getElementById('opacityBtn');
        if (opacityBtn) opacityBtn.addEventListener('click', handleOpacityApply);
        
        const fontFamilyBtn = document.getElementById('fontFamilyBtn');
        if (fontFamilyBtn) fontFamilyBtn.addEventListener('click', handleFontFamilyApply);
        
        const fontSizeBtn = document.getElementById('fontSizeBtn');
        if (fontSizeBtn) fontSizeBtn.addEventListener('click', handleFontSizeApply);
        
        const colorBtn = document.getElementById('colorBtn');
        if (colorBtn) colorBtn.addEventListener('click', handleColorApply);
        
        // 下拉选择
        const editTypeSelect = document.getElementById('editTypeSelect');
        if (editTypeSelect) {
            editTypeSelect.addEventListener('change', function(event) {
                handleEditTypeChange(event.target.value);
            });
        }
        
        const fontFamilySelect = document.getElementById('fontFamilySelect');
        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', function(event) {
                state.textProperties.fontFamily = event.target.value;
            });
        }
        
        // 颜色输入
        const colorInput = document.getElementById('colorInput');
        if (colorInput) {
            colorInput.addEventListener('change', function(event) {
                handleColorPreview(event.target.value);
            });
        }
        
        const colorTextInput = document.getElementById('colorTextInput');
        if (colorTextInput) {
            colorTextInput.addEventListener('blur', function(event) {
                handleColorPreview(event.target.value);
            });
            
            colorTextInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    console.log('颜色输入 Enter 键');
                    handleColorApply();
                    event.preventDefault();
                }
            });
        }
        
        // Enter 键支持
        const inputs = document.querySelectorAll('.input-field, .color-text');
        inputs.forEach(input => {
            input.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    console.log('输入框 Enter 键:', this.id);
                    event.preventDefault();
                    
                    switch (this.id) {
                        case 'widthInput':
                            if (widthBtn) widthBtn.click();
                            break;
                        case 'heightInput':
                            if (heightBtn) heightBtn.click();
                            break;
                        case 'xInput':
                            if (xBtn) xBtn.click();
                            break;
                        case 'yInput':
                            if (yBtn) yBtn.click();
                            break;
                        case 'opacityInput':
                            if (opacityBtn) opacityBtn.click();
                            break;
                        case 'fontSizeInput':
                            if (fontSizeBtn) fontSizeBtn.click();
                            break;
                        case 'colorTextInput':
                            if (colorBtn) colorBtn.click();
                            break;
                    }
                }
            });
        });
        
        console.log('事件监听器初始化完成');
    }

    // ========== 主初始化函数 ==========
    async function init() {
        try {
            console.log('初始化 EditGraphicObject 插件');
            //updateStatus('正在初始化...');
            
            // 设置手型工具
            const tool = await app.getToolByName("Hand");
            await app.setActiveTool(tool, false);
            console.log('设置手型工具成功');

            // 加载 Graphic Object 编辑插件
            let loadState = await app.loadGraphicObjectAddon();
            console.log('Graphic Object Addon Load State:', loadState);

            // 创建 PageEditor 实例
            pageEditor = await PageEditor.create();
            console.log('PageEditor 创建成功');

            // 创建 TextObjectUtils 实例
            textObjectUtils = await TextObjectUtils.create();
            console.log('TextObjectUtils 创建成功');

            updateStatus('插件初始化完成');
            
            // 初始化事件监听
            initEventListeners();

            // 注册选中处理器
            await registerSelectionHandler();

            // 开始轮询
            startPolling();

            console.log('初始化完成');
            updateStatus('就绪');
        } catch (error) {
            console.error('初始化失败:', error);
            updateStatus('初始化失败: ' + error.message);
        }
    }

    // ========== 页面事件监听 ==========
    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM加载完成，开始初始化...');
        // 延迟初始化，确保 SDK 已加载
        setTimeout(init, 2000);
    });

    // 页面卸载时清理
    window.addEventListener('beforeunload', function() {
        stopPolling();
        console.log('页面卸载，清理资源');
    });
    
    // 初始化
    await init();
};