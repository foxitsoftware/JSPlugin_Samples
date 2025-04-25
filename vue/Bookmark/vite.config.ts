import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import legacy from '@vitejs/plugin-legacy';
// 获取环境变量
const isLocal = process.env.FX_JSPLUGINSDK_LOCAL === 'true';

// https://vitejs.dev/config/
export default defineConfig({
    base: './', // 设置 base 为相对路径
    plugins: [
        vue(),
        legacy({
            targets: ['defaults', 'not IE 11']
        })
    ],
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            'fx-jspluginsdk': isLocal
            ? path.resolve(__dirname, '../../../js-engine/ts/')
            : 'fx-jspluginsdk'
        },
    },
    server: {
        port: 5173
    }
})
