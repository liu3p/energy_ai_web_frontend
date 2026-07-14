import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';

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
    }

    static async getLocale() {
        if (Locale.localeName.startsWith('zh-')) {
            Locale.locale = (await import('../locale/zh-cn')).default;
        } else {
            Locale.locale = (await import('../locale/en-us')).default;
        }
    }

    static changeLocale(localeName: string) {
        Locale.setLocaleName(localeName);
        window.location.reload();
    }

    static putUserLang(language: string): Promise<Response<string>> {
        return http.put(`/user/lang/${language}`);
    }
}
