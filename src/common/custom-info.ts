import {ref} from 'vue';
// @ts-ignore
import defFavicon from '@/assets/logo.svg';
import {Locale} from '@/common/locale';

// 动态切换网站图标
const dynamicFavicon = (img: string) => {
    const link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.type = 'image/svg+xml';
    link.href = img;
    document.head.appendChild(link);
};
export const customLogo = ref();

export function setDefInfo() {
    dynamicFavicon(defFavicon);
    setDefTitle();
}

// 设置默认标题
function setDefTitle() {
    document.title = (Locale.locale as any).fw.common.title;
}
