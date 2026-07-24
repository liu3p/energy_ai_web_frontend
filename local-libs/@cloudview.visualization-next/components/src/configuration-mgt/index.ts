import {withInstall} from '@cloudview.visualization-next/utils';
import ConfigurationMgt from './src/index.vue';

const VisConfigurationMgt = withInstall(ConfigurationMgt);

export {VisConfigurationMgt, VisConfigurationMgt as default};
