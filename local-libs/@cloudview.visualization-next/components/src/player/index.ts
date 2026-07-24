import {withInstall} from '@cloudview.visualization-next/utils';
import player from './src/index.vue';

const VisPlayer = withInstall(player);

export {VisPlayer, VisPlayer as default};
