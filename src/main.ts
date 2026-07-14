import {createApp} from 'vue';
import App from './app.vue';
import Router from './router';
import {Locale} from './common/locale';
import './style.scss';
import 'animate.css';
import {setDefInfo} from './common/custom-info';

const app = createApp(App);

Locale.getLocale().then(() => {
    setDefInfo();
    app.use(Router).mount('#app');
});
