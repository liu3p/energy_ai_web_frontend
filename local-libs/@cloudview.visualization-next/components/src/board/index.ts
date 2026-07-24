import {withInstall} from '@cloudview.visualization-next/utils';
import Board from './src/index.vue';

const VisBoard = withInstall(Board);

export {VisBoard, VisBoard as default};
