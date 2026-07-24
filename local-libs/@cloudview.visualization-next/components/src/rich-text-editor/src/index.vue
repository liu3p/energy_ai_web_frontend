<template>
    <div class="vis-rich-text-editor">
        <div
            class="vis-rich-text-editor__tools"
            :class="{'vis-rich-text-editor__tools--disable': mode === 'code'}"
            @click="focus"
        >
            <div class="vis-rich-text-editor__tool">
                <cv-tooltip :content="t('vis.textRichEditor.head')" placement="top">
                    <cv-dropdown
                        placement="bottom"
                        trigger="click"
                        @command="value => editor.doCommand('formatBlock', value)"
                    >
                        <span class="cv-dropdown-link">
                            <cv-icon>
                                <cv-icon-editor-h></cv-icon-editor-h>
                            </cv-icon>
                        </span>
                        <template #dropdown>
                            <cv-dropdown-menu>
                                <cv-dropdown-item command="<h1>">
                                    <h1 class="vis-rich-text-editor__tool-h">H1</h1>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="<h2>">
                                    <h2 class="vis-rich-text-editor__tool-h">H2</h2>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="<h3>">
                                    <h3 class="vis-rich-text-editor__tool-h">H3</h3>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="<h4>">
                                    <h4 class="vis-rich-text-editor__tool-h">H4</h4>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="<h5>">
                                    <h5 class="vis-rich-text-editor__tool-h">H5</h5>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="<h6>">
                                    <h6 class="vis-rich-text-editor__tool-h">H6</h6>
                                </cv-dropdown-item>
                            </cv-dropdown-menu>
                        </template>
                    </cv-dropdown>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool">
                <cv-tooltip :content="t('vis.textRichEditor.bold')" placement="top">
                    <cv-icon>
                        <cv-icon-strong @click="() => editor.doCommand('bold')"></cv-icon-strong>
                    </cv-icon>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool">
                <cv-tooltip :content="t('vis.textRichEditor.italic')" placement="top">
                    <cv-icon>
                        <cv-icon-italic @click="() => editor.doCommand('italic')"></cv-icon-italic>
                    </cv-icon>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool">
                <cv-tooltip :content="t('vis.textRichEditor.fontSize')" placement="top">
                    <cv-dropdown
                        placement="bottom"
                        trigger="click"
                        @command="value => editor.doCommand('fontSize', value)"
                    >
                        <span class="cv-dropdown-link">
                            <cv-icon>
                                <cv-icon-font-size></cv-icon-font-size>
                            </cv-icon>
                        </span>
                        <template #dropdown>
                            <cv-dropdown-menu>
                                <cv-dropdown-item command="1">
                                    <div style="font-size: x-small; text-align: center">x-small</div>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="2">
                                    <div style="font-size: small; text-align: center">small</div>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="3">
                                    <div style="font-size: medium; text-align: center">medium</div>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="4">
                                    <div style="font-size: large; text-align: center">large</div>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="5">
                                    <div style="font-size: x-large; text-align: center">x-large</div>
                                </cv-dropdown-item>
                                <cv-dropdown-item command="6">
                                    <div style="font-size: xx-large; text-align: center">xx-large</div>
                                </cv-dropdown-item>
                            </cv-dropdown-menu>
                        </template>
                    </cv-dropdown>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool">
                <vis-rich-text-editor-color-tool
                    type="foreColor"
                    :editor="editor"
                    :title="t('vis.textRichEditor.fontColor')"
                ></vis-rich-text-editor-color-tool>
            </div>
            <div class="vis-rich-text-editor__tool">
                <vis-rich-text-editor-color-tool
                    type="backColor"
                    :editor="editor"
                    :title="t('vis.textRichEditor.backColor')"
                ></vis-rich-text-editor-color-tool>
            </div>
            <div class="vis-rich-text-editor__tool">
                <vis-rich-text-editor-link-tool :editor="editor"></vis-rich-text-editor-link-tool>
            </div>
            <div class="vis-rich-text-editor__tool">
                <cv-tooltip :content="t('vis.textRichEditor.alignment')" placement="top">
                    <cv-dropdown
                        placement="bottom"
                        trigger="click"
                        :title="t('vis.textRichEditor.alignment')"
                        @command="value => editor.doCommand(value)"
                    >
                        <span class="cv-dropdown-link">
                            <cv-icon>
                                <cv-icon-align-center></cv-icon-align-center>
                            </cv-icon>
                        </span>
                        <template #dropdown>
                            <cv-dropdown-menu>
                                <cv-dropdown-item command="justifyLeft">
                                    <cv-icon>
                                        <cv-icon-align-left></cv-icon-align-left>
                                    </cv-icon>
                                    {{ t('vis.textRichEditor.leftAlignment') }}
                                </cv-dropdown-item>
                                <cv-dropdown-item command="justifyRight">
                                    <cv-icon>
                                        <cv-icon-align-right></cv-icon-align-right>
                                    </cv-icon>
                                    {{ t('vis.textRichEditor.rightAlignment') }}
                                </cv-dropdown-item>
                                <cv-dropdown-item command="justifyCenter">
                                    <cv-icon>
                                        <cv-icon-align-center></cv-icon-align-center>
                                    </cv-icon>
                                    {{ t('vis.textRichEditor.centerAlignment') }}
                                </cv-dropdown-item>
                            </cv-dropdown-menu>
                        </template>
                    </cv-dropdown>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool">
                <cv-tooltip :content="t('vis.textRichEditor.list')" placement="top">
                    <cv-dropdown
                        placement="bottom"
                        trigger="click"
                        :title="t('vis.textRichEditor.list')"
                        @command="value => editor.doCommand(value)"
                    >
                        <span class="cv-dropdown-link">
                            <cv-icon>
                                <cv-icon-ordered-list></cv-icon-ordered-list>
                            </cv-icon>
                        </span>
                        <template #dropdown>
                            <cv-dropdown-menu>
                                <cv-dropdown-item command="insertUnorderedList">
                                    <cv-icon>
                                        <cv-icon-unordered-list></cv-icon-unordered-list>
                                    </cv-icon>
                                    {{ t('vis.textRichEditor.unorderedList') }}
                                </cv-dropdown-item>
                                <cv-dropdown-item command="insertOrderedList">
                                    <cv-icon>
                                        <cv-icon-ordered-list></cv-icon-ordered-list>
                                    </cv-icon>
                                    {{ t('vis.textRichEditor.orderedList') }}
                                </cv-dropdown-item>
                            </cv-dropdown-menu>
                        </template>
                    </cv-dropdown>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool">
                <vis-rich-text-editor-table-tool :editor="editor"></vis-rich-text-editor-table-tool>
            </div>
            <div class="vis-rich-text-editor__tool">
                <cv-tooltip :content="t('vis.textRichEditor.undo')" placement="top">
                    <cv-icon>
                        <cv-icon-editor-cancel @click="() => editor.doCommand('undo')"></cv-icon-editor-cancel>
                    </cv-icon>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool">
                <cv-tooltip :content="t('vis.textRichEditor.redo')" placement="top">
                    <cv-icon>
                        <cv-icon-editor-redo @click="() => editor.doCommand('redo')"></cv-icon-editor-redo>
                    </cv-icon>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool vis-rich-text-editor__mode-tool">
                <cv-tooltip v-if="mode === 'view'" :content="t('vis.textRichEditor.codeMode')" placement="top">
                    <cv-icon>
                        <cv-icon-editor-view v-show="mode === 'view'" @click="changeMode"></cv-icon-editor-view>
                    </cv-icon>
                </cv-tooltip>
                <cv-tooltip v-if="mode === 'code'" :content="t('vis.textRichEditor.viewMode')" placement="top">
                    <cv-icon>
                        <cv-icon-code @click="changeMode"></cv-icon-code>
                    </cv-icon>
                </cv-tooltip>
            </div>
            <div class="vis-rich-text-editor__tool">
                <div
                    class="vis-rich-text-editor__tool-icon"
                    @click="
                        focus();
                        addBinding();
                    "
                >
                    [{{ t('vis.textRichEditor.dataBinding') }}]
                </div>
            </div>
        </div>
        <div class="vis-rich-text-editor__main">
            <div
                v-show="mode === 'view'"
                ref="view"
                class="vis-rich-text-editor__view"
                :style="{'backgroundColor': props.backColor, 'color': props.foreColor}"
                contenteditable="true"
                @click="editBinding"
            ></div>
            <textarea v-show="mode === 'code'" v-model="editValue" class="vis-rich-text-editor__code"></textarea>
        </div>

        <cv-dialog
            v-model="dataBindingDisplay"
            :title="t('vis.textRichEditor.dataBinding')"
            width="300px"
            top="10vh"
            append-to-body
            destroy-on-close
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            <div style="height: 420px">
                <vis-data-binding
                    :show-header="false"
                    :visible="dataBindingDisplay"
                    :bindings="bindings"
                    :key-config="keyConfig"
                    :devices="primitive?.devices"
                    :binding-key="bindingKey"
                    data-type="string"
                >
                </vis-data-binding>
            </div>
            <template #footer>
                <cv-button type="primary" size="small" @click="insertDataBinding">
                    {{ t('vis.textRichEditor.insert') }}
                </cv-button>
                <cv-button size="small" @click="dataBindingDisplay = false">
                    {{ t('vis.textRichEditor.cancel') }}
                </cv-button>
            </template>
        </cv-dialog>
    </div>
</template>
<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {inject, onMounted, ref} from 'vue';
import {Editor} from './editor.class';
import {
    decodeInsertBinding,
    editPrimitive,
    encodeInsertBinding,
    IdUtils,
    type IPrimitiveBindings,
    valueBinding,
} from '@cloudview.visualization-next/services';
import VisRichTextEditorTableTool from './table-tool.vue';
import VisRichTextEditorColorTool from './color-tool.vue';
import VisRichTextEditorLinkTool from './link-tool.vue';
import VisDataBinding from '../../data-binding';
import {
    CvIconAlignCenter,
    CvIconAlignLeft,
    CvIconAlignRight,
    CvIconCode,
    CvIconEditorCancel,
    CvIconEditorH,
    CvIconEditorRedo,
    CvIconEditorView,
    CvIconOrderedList,
    CvIconUnorderedList,
} from 'cloudview.ui-next-icon';

defineOptions({name: 'VisRichTextEditor'});
const props = withDefaults(
    defineProps<{
        modelValue: string;
        foreColor: string;
        backColor: string;
    }>(),
    {
        foreColor: '#222',
        backColor: '#fff',
    }
);

const {t} = useLocale();
const editor = ref<Editor>();
const mode = ref('view');
const editValue = ref(props.modelValue);
const view = ref();
let editPlaceHolder: Element | null;

const changeMode = () => {
    if (mode.value === 'view') {
        editValue.value = view.value.innerHTML;
        mode.value = 'code';
    } else {
        mode.value = 'view';
        view.value.innerHTML = editValue.value;
    }
};

const focus = () => {
    if (!editor.value?.currentRange) {
        view.value.focus();
        editor.value?.saveRange();
    }
};

// 插值
const primitive = inject(editPrimitive);
const keyConfig = {attrType: 'insertValue', name: '插值', id: 'insertValue'};
const bindingKey = 'insertValue';
const bindings = ref<IPrimitiveBindings>({});
const dataBindingDisplay = ref(false);
const addBinding = () => {
    bindings.value = {};
    dataBindingDisplay.value = true;
};

const editBinding = event => {
    if (event.target.hasAttribute('data-binding')) {
        editPlaceHolder = event.target;
        bindings.value = {
            'insertValue': JSON.parse(decodeURIComponent(window.atob(event.target.getAttribute('data-binding')))),
        };
        dataBindingDisplay.value = true;
    }
};

const getBindingLabel = (bindingType: string) => {
    let label = '';
    valueBinding.some(item => {
        if (item.value === bindingType) {
            label = t(item.label);
            return true;
        }
        return false;
    });
    return label;
};

const insertDataBinding = async () => {
    if (Reflect.has(bindings.value, 'insertValue')) {
        const binding = bindings.value.insertValue;
        // 计算类型名称
        const dataUrl = await Editor.getPlaceHolder(`[${getBindingLabel(binding.type)}]`);
        const bindingData = encodeInsertBinding(binding);
        if (editPlaceHolder) {
            editPlaceHolder.setAttribute('data-binding', bindingData);
            editPlaceHolder.setAttribute('src', dataUrl);
        } else {
            const placeHolder = `<img data-binding='${bindingData}' src='${dataUrl}' width="80" style="vertical-align: middle"/>`;
            editor.value?.doCommand('insertHTML', placeHolder);
        }
    } else if (editPlaceHolder) {
        editPlaceHolder.parentNode!.removeChild(editPlaceHolder);
    }
    editPlaceHolder = null;
    dataBindingDisplay.value = false;
};

const getValue = () => {
    const content = mode.value === 'view' ? view.value.innerHTML : editValue.value;
    const result = {content, template: '', insertBindings: {}};
    result.template = content.replace(/<img\s*data-binding="(.+?)".+?>/g, (match, data) => {
        const binding = decodeInsertBinding(data);
        const bindingId = IdUtils.getInsertValueId();
        result.insertBindings[bindingId] = binding;
        return `<span>{{${bindingId}}}</span>`;
    });
    return result;
};

defineExpose({
    getValue,
});

onMounted(() => {
    editor.value = new Editor(view.value);
    view.value.innerHTML = props.modelValue;
});
</script>
