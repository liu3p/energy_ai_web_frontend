import {withInstall} from '@cloudview.visualization-next/utils';
import ConfigProvider from './src/index.vue';

const VisConfigProvider = withInstall(ConfigProvider);

export {VisConfigProvider, VisConfigProvider as default};
