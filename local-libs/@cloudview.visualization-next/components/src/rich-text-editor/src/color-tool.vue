<template>
    <cv-popover v-model="visible" placement="bottom" trigger="click">
        <div class="vis-rich-text-editor-color">
            <div
                v-for="(color, index) in colors"
                :key="index"
                class="vis-rich-text-editor-color__item"
                :style="{'background-color': color}"
                :title="color"
                @click="save(color)"
            ></div>
        </div>
        <template #reference>
            <div>
                <cv-tooltip :content="props.title" placement="top">
                    <cv-icon>
                        <cv-icon-font-color v-if="type === 'foreColor'"></cv-icon-font-color>
                        <cv-icon-bg-color v-if="type === 'backColor'"></cv-icon-bg-color>
                    </cv-icon>
                </cv-tooltip>
            </div>
        </template>
    </cv-popover>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import type {Editor} from './editor.class';

defineOptions({name: 'VisRichTextEditorColorTool'});
const props = withDefaults(
    defineProps<{
        type: string;
        title: string;
        editor: Editor;
    }>(),
    {type: 'font'}
);

const visible = ref(false);
const colors = ['black', 'white', 'gray', 'red', 'yellow', 'green', 'blue', 'pink', 'purple', 'brown'];
const save = (color: string) => props.editor.doCommand(props.type, color);
</script>
