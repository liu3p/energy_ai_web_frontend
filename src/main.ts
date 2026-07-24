import {createApp} from 'vue';
import App from './app.vue';
import Router from './router';
import {Locale} from './common/locale';
import './style.scss';
import 'animate.css';
import {setDefInfo} from './common/custom-info';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App);
app.use(ElementPlus)

Locale.getLocale().then(() => {
    setDefInfo();
    app.use(Router).mount('#app');
});
