<template>
    <cv-popover v-model="visible" placement="bottom" trigger="click" width="280">
        <div class="vis-rich-text-editor-table-tool">
            <cv-tabs v-model="activeTab" :panes="panes" :stretch="true"></cv-tabs>
            <div v-if="activeTab === 'insert'">
                <cv-form size="default" class="vis-rich-text-editor-table-tool__form" :inline="true" :model="form">
                    <div class="vis-rich-text-editor-table-tool__form-row">
                        <cv-form-item :label="t('vis.textRichEditor.cell')"></cv-form-item>
                        <cv-form-item :label="t('vis.textRichEditor.row')">
                            <cv-input
                                v-model="form.row"
                                class="vis-rich-text-editor-table-tool__form-input"
                                size="default"
                            ></cv-input>
                        </cv-form-item>
                        <cv-form-item :label="t('vis.textRichEditor.column')">
                            <cv-input
                                v-model="form.col"
                                class="vis-rich-text-editor-table-tool__form-input"
                                size="default"
                            ></cv-input>
                        </cv-form-item>
                    </div>
                    <div class="vis-rich-text-editor-table-tool__form-row">
                        <cv-form-item :label="t('vis.textRichEditor.size')"></cv-form-item>
                        <cv-form-item :label="t('vis.textRichEditor.width')">
                            <cv-input
                                v-model="form.width"
                                class="vis-rich-text-editor-table-tool__form-input"
                                size="default"
                            >
                                <template #append>
                                    <cv-select
                                        v-model="form.widthUnit"
                                        class="vis-rich-text-editor-table-tool__form-select"
                                    >
                                        <cv-option value="%" label="%"></cv-option>
                                        <cv-option value="px" label="px"></cv-option>
                                    </cv-select>
                                </template>
                            </cv-input>
                        </cv-form-item>
                        <cv-form-item :label="t('vis.textRichEditor.height')">
                            <cv-input
                                v-model="form.height"
                                class="vis-rich-text-editor-table-tool__form-input"
                                size="default"
                            >
                                <template #append>
                                    <cv-select
                                        v-model="form.heightUnit"
                                        class="vis-rich-text-editor-table-tool__form-select"
                                    >
                                        <cv-option value="%" label="%"></cv-option>
                                        <cv-option value="px" label="px"></cv-option>
                                    </cv-select>
                                </template>
                            </cv-input>
                        </cv-form-item>
                    </div>
                    <div class="vis-rich-text-editor-table-tool__form-row">
                        <cv-form-item :label="t('vis.textRichEditor.border')"></cv-form-item>
                        <cv-form-item :label="t('vis.textRichEditor.width')">
                            <cv-input
                                v-model="form.borderWidth"
                                class="vis-rich-text-editor-table-tool__form-input"
                                size="default"
                            ></cv-input>
                        </cv-form-item>
                        <cv-form-item :label="t('vis.textRichEditor.color')">
                            <cv-color-picker v-model="form.borderColor" size="small"></cv-color-picker>
                        </cv-form-item>
                    </div>
                    <div class="vis-rich-text-editor-table-tool__form-row">
                        <cv-form-item :label="t('vis.textRichEditor.gap')"></cv-form-item>
                        <cv-form-item :label="t('vis.textRichEditor.inner')">
                            <cv-input
                                v-model="form.padding"
                                class="vis-rich-text-editor-table-tool__form-input"
                                size="default"
                            ></cv-input>
                        </cv-form-item>
                    </div>
                    <div class="vis-rich-text-editor-table-tool__form-button">
                        <cv-button type="primary" size="small" @click="save">
                            {{ t('vis.textRichEditor.insert') }}
                        </cv-button>
                    </div>
                </cv-form>
            </div>
            <div v-if="activeTab === 'edit'">
                <cv-button class="vis-rich-text-editor-table-tool__edit-button" size="default" @click="edit('addRow')"
                    >{{ t('vis.textRichEditor.addRow') }}
                </cv-button>
                <cv-button
                    class="vis-rich-text-editor-table-tool__edit-button"
                    size="default"
                    @click="edit('deleteRow')"
                    >{{ t('vis.textRichEditor.deleteRow') }}
                </cv-button>
                <cv-button
                    class="vis-rich-text-editor-table-tool__edit-button"
                    size="default"
                    @click="edit('addColumn')"
                    >{{ t('vis.textRichEditor.addColumn') }}
                </cv-button>
                <cv-button
                    class="vis-rich-text-editor-table-tool__edit-button"
                    size="default"
                    @click="edit('deleteColumn')"
                    >{{ t('vis.textRichEditor.deleteColumn') }}
                </cv-button>
                <cv-button
                    class="vis-rich-text-editor-table-tool__edit-button"
                    size="default"
                    @click="edit('deleteTable')"
                    >{{ t('vis.textRichEditor.deleteTable') }}
                </cv-button>
            </div>
        </div>
        <template #reference>
            <div>
                <cv-tooltip :content="t('vis.textRichEditor.table')" placement="top">
                    <cv-icon>
                        <cv-icon-table @click="discernEnvironment"></cv-icon-table>
                    </cv-icon>
                </cv-tooltip>
            </div>
        </template>
    </cv-popover>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {reactive, ref} from 'vue';
import type {Editor} from './editor.class';
import {CvIconTable} from 'cloudview.ui-next-icon';

defineOptions({name: 'VisRichTextEditorTableTool'});
const props = defineProps<{
    editor: Editor;
}>();

const {t} = useLocale();
const visible = ref(false);
const inTable = ref(false);
const activeTab = ref('insert');
const panes = ref([
    {
        label: t('vis.textRichEditor.insertTable'),
        name: 'insert',
    },
    {
        label: t('vis.textRichEditor.editTable'),
        name: 'edit',
    },
]);
const form = reactive({
    row: 3,
    col: 3,
    width: '100',
    widthUnit: '%',
    height: '30',
    heightUnit: '%',
    borderWidth: '1',
    borderColor: '#000',
    padding: '5',
});

const insertAfter = (newElement: Element, targetElement: Element) => {
    const parent = targetElement.parentNode;
    if (parent!.lastChild === targetElement) {
        parent!.appendChild(newElement);
    } else {
        parent!.insertBefore(newElement, targetElement.nextElementSibling);
    }
};

const discernEnvironment = () => {
    const el = props.editor.getSelectionContainerElem();
    if (el && el.tagName === 'TD') {
        inTable.value = true;
        return true;
    }
    inTable.value = false;
    activeTab.value = 'insert';
};

const edit = type => {
    const el = props.editor.getSelectionContainerElem();
    if (el.tagName !== 'TD') {
        return false;
    }
    const tr = el.parentNode,
        tbody = tr.parentNode;

    switch (type) {
        case 'addRow': {
            const newTr = document.createElement('tr');
            for (let i = 0; i < tr.childNodes.length; i++) {
                newTr.appendChild(el.cloneNode());
            }
            insertAfter(newTr, tr);
            break;
        }
        case 'deleteRow':
            if (tbody.childNodes.length > 1) {
                tbody.removeChild(tr);
                visible.value = false;
            } else {
                edit('deleteTable');
            }
            break;
        case 'addColumn': {
            const index = Array.from(tr.childNodes).indexOf(el);
            for (let i = 0; i < tbody.childNodes.length; i++) {
                const currTr = tbody.childNodes[i];
                insertAfter(el.cloneNode(), currTr.childNodes[index]);
            }
            break;
        }
        case 'deleteColumn': {
            if (tr.childNodes.length > 1) {
                const index = Array.from(tr.childNodes).indexOf(el);
                for (let i = 0; i < tbody.childNodes.length; i++) {
                    const currTr = tbody.childNodes[i];
                    currTr.removeChild(currTr.childNodes[index]);
                }
                visible.value = false;
            } else {
                edit('deleteTable');
            }
            break;
        }
        case 'deleteTable': {
            const table = tbody.parentNode;
            table.parentNode.removeChild(table);
            visible.value = false;
            break;
        }
        default:
    }
};

const save = () => {
    let tableCell = '';
    for (let r = 0; r < form.row; r++) {
        tableCell += '<tr>';
        for (let c = 0; c < form.col; c++) {
            tableCell += `<td style="border:${form.borderWidth}px solid ${form.borderColor}; border-right: none; border-bottom: none; padding:${form.padding}px"></td>`;
        }
        tableCell += '</tr>';
    }
    const table = `<table style="width: ${form.width}${form.widthUnit}; height: ${
        form.height === '' ? 'auto' : form.height + form.heightUnit
    }; border: ${form.borderWidth}px solid ${
        form.borderColor
    }; border-top: none; border-left: none; border-collapse: collapse">${tableCell}</table>`;
    props.editor.doCommand('insertHTML', table);
    visible.value = false;
};
</script>
