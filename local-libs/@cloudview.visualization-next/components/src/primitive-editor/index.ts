import {withInstall} from '@cloudview.visualization-next/utils';
import primitiveEditor from './src/index.vue';

const VisPrimitiveEditor = withInstall(primitiveEditor);

export {VisPrimitiveEditor, VisPrimitiveEditor as default};
