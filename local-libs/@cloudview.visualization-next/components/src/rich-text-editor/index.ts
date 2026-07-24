import {withInstall} from '@cloudview.visualization-next/utils';
import richTextEditor from './src/index.vue';

const VisRichTextEditor = withInstall(richTextEditor);

export {VisRichTextEditor, VisRichTextEditor as default};
