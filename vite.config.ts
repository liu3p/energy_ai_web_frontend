import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
// @ts-ignore
import {CloudViewResolver} from 'cloudview.ui-next/utils';
import {resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

// 打包日期插件 - 修改 config.js 添加 build_date 字段
const buildDatePlugin = () => {
    return {
        name: 'build-date-plugin',
        writeBundle() {
            const buildDate = new Date().toLocaleDateString('zh-CN') + '-' + new Date().toLocaleTimeString('zh-CN');
            const configPath = 'dist/config.js';
            let configContent = readFileSync(configPath, 'utf-8');
            // 移除旧的 build_date 字段
            configContent = configContent.replace(/,\s*build_date:\s*['"].*?['"]/g, '');
            // 在 Window.BUILD_INFO 对象中添加 build_date
            configContent = configContent.replace(/(Window\.BUILD_INFO\s*=\s*\{[^}]+\})/, match => {
                return match.replace(/\}$/, `\tbuild_date: '${buildDate}'\n}`);
            });
            writeFileSync(configPath, configContent, 'utf-8');
        },
    };
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [CloudViewResolver()],
            eslintrc: {
                enabled: true,
                filepath: './.eslintrc-auto-import.json',
                globalsPropValue: true,
            },
        }),
        Components({
            resolvers: [
                CloudViewResolver({
                    importStyle: 'sass',
                }),
            ],
        }),
        buildDatePlugin(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:38080',
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve('./src'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "./src/var.scss" as *;`,
            },
        },
    },
});
