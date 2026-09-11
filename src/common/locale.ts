import {nextTick, ref} from 'vue';
import {ElLoading} from 'element-plus';
import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';
import {setLocaleMessages} from '@/shims/cloudview-ui-next/locale-store';
import zhCn from '../locale/zh-cn';
import enUs from '../locale/en-us';

function readStoredLocaleName(): string {
    return localStorage.getItem('localeName') || navigator.language || 'zh-CN';
}

/** 响应式当前语言，切换后界面可据此刷新 */
export const currentLocale = ref(readStoredLocaleName());

export class Locale {
    private static _localeName: string | null = null;
    static locale: Record<string, unknown> = {};

    static get localeName() {
        return (
            Locale._localeName ||
            (Locale._localeName = localStorage.getItem('localeName')) ||
            (Locale._localeName = navigator.language)
        );
    }

    private static setLocaleName(localeName: string) {
        Locale._localeName = localeName;
        localStorage.setItem('localeName', localeName);
        currentLocale.value = localeName;
    }

    static getMessages(localeName = Locale.localeName) {
        return (localeName.startsWith('zh-') ? zhCn : enUs) as Record<string, unknown>;
    }

    static async getLocale() {
        Locale.locale = Locale.getMessages();
    }

    static changeLocale(localeName: string) {
        const loading = ElLoading.service({
            lock: true,
            text: localeName.startsWith('zh-') ? '切换语言中...' : 'Switching language...',
            background: 'rgba(255, 255, 255, 0.65)',
        });

        Locale.setLocaleName(localeName);
        const messages = Locale.getMessages(localeName);
        Locale.locale = messages;
        setLocaleMessages(messages);
        document.title = ((messages as {fw?: {common?: {title?: string}}}).fw?.common?.title) || document.title;

        // 等按新语言重挂载后再关掉 loading，避免白屏感
        nextTick(() => {
            setTimeout(() => loading.close(), 200);
        });
    }

    static putUserLang(language: string): Promise<Response<string>> {
        return http.put(`/user/lang/${language}`);
    }
}
