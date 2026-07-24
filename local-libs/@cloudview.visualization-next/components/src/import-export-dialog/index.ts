import {withInstall} from '@cloudview.visualization-next/utils';
import ImportExportDialog from './src/index.vue';

const VisImportExportDialog = withInstall(ImportExportDialog);

export {VisImportExportDialog, VisImportExportDialog as default};

export * from './src/types';
