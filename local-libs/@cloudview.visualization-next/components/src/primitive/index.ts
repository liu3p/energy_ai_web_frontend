import {withInstall} from '@cloudview.visualization-next/utils';
import primitive from './src/index.vue';

const VisPrimitive = withInstall(primitive);

export {VisPrimitive, VisPrimitive as default};
