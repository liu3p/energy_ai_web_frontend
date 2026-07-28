import {defineComponent, h} from 'vue';
import {ElLoading} from 'element-plus';
import {
    ElButton,
    ElCheckbox,
    ElCheckboxGroup,
    ElDatePicker,
    ElDialog,
    ElDrawer,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElForm,
    ElFormItem,
    ElIcon,
    ElInput,
    ElInputNumber,
    ElOption,
    ElPagination,
    ElPopover,
    ElProgress,
    ElScrollbar,
    ElSelect,
    ElSwitch,
    ElTable,
    ElTableColumn,
    ElTabPane,
    ElTabs,
    ElTag,
    ElTooltip,
    ElTree,
    ElTreeSelect,
    ElUpload,
} from 'element-plus';
import CvConfigProvider from './CvConfigProvider.vue';
import {translate} from './locale-store';
import {Http, type Response} from './http';
import {ElMessage, ElMessageBox} from 'element-plus';

export {Http, type Response};

export function useLocale() {
    return {
        t: translate,
        locale: 'zh-cn',
        changeLocale: () => {},
    };
}

export function useHttp() {
    return new Http();
}

export const CvMessage = ElMessage;
export const CvMessageBox = ElMessageBox;
export const CvLoadingDirective = ElLoading.directive;

export {default as CvConfigProvider} from './CvConfigProvider.vue';
export const CvButton = ElButton;
export const CvCheckbox = ElCheckbox;
export const CvCheckboxGroup = ElCheckboxGroup;
export const CvDatePicker = ElDatePicker;
export const CvDialog = ElDialog;
export const CvDrawer = ElDrawer;
export const CvDropdown = ElDropdown;
export const CvDropdownItem = ElDropdownItem;
export const CvDropdownMenu = ElDropdownMenu;
export const CvForm = ElForm;
export const CvFormItem = ElFormItem;
export const CvIcon = ElIcon;
export const CvInput = ElInput;
export const CvInputNumber = ElInputNumber;
export const CvOption = ElOption;
export const CvPagination = ElPagination;
export const CvPopover = ElPopover;
export const CvProgress = ElProgress;
export const CvScrollbar = ElScrollbar;
export const CvSelect = ElSelect;
export const CvSelectTree = ElTreeSelect;
export const CvSwitch = ElSwitch;
export const CvTable = ElTable;
export const CvTableColumn = ElTableColumn;
export const CvTabPane = ElTabPane;
export const CvTabs = ElTabs;
export const CvTag = ElTag;
export const CvTooltip = ElTooltip;
export const CvTree = ElTree;
export const CvUpload = ElUpload;

export const CvDialogForm = ElDialog;

export const CvSidebar = defineComponent({
    name: 'CvSidebar',
    setup(_, {slots}) {
        return () => h('div', {class: 'cv-sidebar'}, slots.default?.());
    },
});

export default {
    install() {},
};
