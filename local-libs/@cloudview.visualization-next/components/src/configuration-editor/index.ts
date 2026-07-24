import {withInstall} from '@cloudview.visualization-next/utils';
import ConfigurationEditor from './src/index.vue';

const VisConfigurationEditor = withInstall(ConfigurationEditor);

export {VisConfigurationEditor, VisConfigurationEditor as default};
