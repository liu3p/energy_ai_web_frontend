import {withInstall} from '@cloudview.visualization-next/utils';
import MgtFramework from './src/index.vue';

export type {IQuery as IMgtFrameworkQuery} from './src/props';

const VisMgtFramework = withInstall(MgtFramework);

export {VisMgtFramework, VisMgtFramework as default};
