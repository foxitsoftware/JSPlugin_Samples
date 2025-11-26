import { createApp, App } from 'vue';
import './style.css';
import AppComponent from './App.vue';

import {
    App as PluginApp
// @ts-ignore
} from 'fx-jspluginsdk';
import {
    // component
    NButton,
    NDivider,
    NSelect,
    NConfigProvider,
    // create naive ui
    create
} from 'naive-ui';

const naive = create({
    components: [
        NButton,
        NDivider,
        NSelect,
        NConfigProvider
    ]
});
async function bootstrap() {
    const app: App = createApp(AppComponent);
    const pluginApp: any = await PluginApp.create({
        pluginInfo: {
            id: 'EditGraphicObject',
            name: 'EditGraphicObject',
            version: '',
            description: '',
            author: '',
            license: ''
        }
    });
    // 挂载全局变量
    app.config.globalProperties.$pluginApp = pluginApp;
    app.use(naive);
    app.mount('#app');
}
bootstrap();