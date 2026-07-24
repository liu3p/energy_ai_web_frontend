import {withInstall} from '@cloudview.visualization-next/utils';
import configurationBrowser from './src/index.vue';

const VisConfigurationBrowser = withInstall(configurationBrowser);

export {VisConfigurationBrowser, VisConfigurationBrowser as default};
