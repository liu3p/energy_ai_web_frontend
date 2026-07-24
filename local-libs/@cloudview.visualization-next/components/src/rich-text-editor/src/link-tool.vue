<template>
    <cv-popover v-model="visible" placement="bottom" trigger="click" width="280">
        <div class="vis-rich-text-editor-link-tool">
            <cv-form size="small" :inline="true">
                <cv-form-item :label="t('vis.textRichEditor.url')">
                    <cv-input v-model="href" placeholder="http://" size="default"></cv-input>
                </cv-form-item>
                <div class="vis-rich-text-editor-link-tool__button">
                    <cv-button size="default" @click="cancel">{{ t('vis.textRichEditor.delete') }}</cv-button>
                    <cv-button type="primary" size="default" @click="save">
                        {{ t('vis.textRichEditor.confirm') }}
                    </cv-button>
                </div>
            </cv-form>
        </div>

        <template #reference>
            <div>
                <cv-tooltip :content="t('vis.textRichEditor.url')" placement="top">
                    <cv-icon>
                        <cv-icon-link @click="discernEnvironment"></cv-icon-link>
                    </cv-icon>
                </cv-tooltip>
            </div>
        </template>
    </cv-popover>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import type {Editor} from './editor.class';

defineOptions({name: 'VisRichTextEditorLinkTool'});
const props = defineProps<{
    editor: Editor;
}>();

const {t} = useLocale();
const visible = ref(false);
const href = ref('');

const discernEnvironment = () => {
    const el = props.editor.getSelectionContainerElem();
    if (el && el.tagName === 'A') {
        href.value = el.getAttribute('href');
    }
};
const save = () => {
    props.editor.doCommand('createLink', href.value);
    visible.value = false;
};
const cancel = () => {
    props.editor.doCommand('unlink');
    visible.value = false;
};
</script>
