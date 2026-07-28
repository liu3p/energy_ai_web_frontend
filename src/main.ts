import {createApp} from 'vue';
import App from './app.vue';
import Router from './router';
import {Locale} from './common/locale';
import './style.scss';
import 'animate.css';
import {setDefInfo} from './common/custom-info';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as CloudView from '@/shims/cloudview-ui-next';
import {setLocaleMessages} from '@/shims/cloudview-ui-next/locale-store';
import zhCn from './locale/zh-cn';
import enUs from './locale/en-us';

const app = createApp(App);
app.use(ElementPlus);

Object.entries(CloudView).forEach(([name, component]) => {
    if (name.startsWith('Cv') && typeof component === 'object' && component !== null) {
        app.component(name, component as never);
    }
});

Locale.getLocale().then(() => {
    const messages = Locale.localeName.startsWith('zh-') ? zhCn : enUs;
    setLocaleMessages(messages as Record<string, unknown>);
    setDefInfo();
    app.use(Router).mount('#app');
});
