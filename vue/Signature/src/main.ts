import { createApp, App } from 'vue';
import './style.css';
import AppComponent from './App.vue';

import {
    App as PluginApp
// @ts-ignore
} from 'fx-jspluginsdk';

import {
    // component
    NInput,
    NButton,
    NDivider,
    NSelect,
    NConfigProvider,
    // create naive ui
    create,
    NList,
    NListItem,
    NDataTable
} from 'naive-ui';

const naive = create({
    components: [
        NInput,
        NButton,
        NDivider,
        NSelect,
        NConfigProvider,
        NList,
        NListItem,
        NDataTable
    ]
});
async function bootstrap() {
    const app: App = createApp(AppComponent);
    const pluginApp: any = await PluginApp.create({
        pluginInfo: {
            id: 'SearchText',
            name: 'SearchText',
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
