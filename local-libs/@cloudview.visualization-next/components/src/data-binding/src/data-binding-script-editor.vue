<template>
    <div class="vis-data-binding-script-editor" :style="{'--vis-data-binding-script-editor-height': props.height}">
        <div class="vis-data-binding-script-editor__tools">
            <cv-tooltip v-if="!props.isEvent" :content="t('vis.scriptEditor.valueTips')" placement="top">
                <cv-button type="primary" text @click="getValue">{{ t('vis.scriptEditor.rawValue') }}</cv-button>
            </cv-tooltip>
            <cv-button type="primary" text @click="getPrimitiveAttr"
                >{{ t('vis.scriptEditor.getPrimitiveAttr') }}
            </cv-button>
            <cv-button type="primary" text @click="setPrimitiveAttr"
                >{{ t('vis.scriptEditor.setPrimitiveAttr') }}
            </cv-button>
            <cv-button type="primary" text @click="getBoardAttr">{{ t('vis.scriptEditor.getBoardAttr') }}</cv-button>
            <cv-button type="primary" text @click="setBoardAttr">{{ t('vis.scriptEditor.setBoardAttr') }}</cv-button>
            <cv-button type="primary" text @click="timeout">{{ t('vis.scriptEditor.setTimeout') }}</cv-button>
            <cv-button type="primary" text @click="interval">{{ t('vis.scriptEditor.setInterval') }}</cv-button>
        </div>
        <div ref="editorWrap" class="vis-data-binding-script-editor__editor"></div>
    </div>
</template>
<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/snippets/javascript';
import jsWorkerUrl from './ace-javascript-worker';

// eslint-disable-next-line
ace.config.setModuleUrl('ace/mode/javascript_worker', jsWorkerUrl);

defineOptions({name: 'VisDataBindingScriptEditor'});
const props = withDefaults(
    defineProps<{
        modelValue: string;
        height?: string;
        isEvent: boolean;
    }>(),
    {
        height: '380px',
        isEvent: false,
    }
);
const emit = defineEmits(['update:modelValue']);
const {t} = useLocale();

const editorWrap = ref();
let editor;

const insertCode = (code: string) => {
    editor.insert(code);
    editor.focus();
};
const getValue = () => {
    insertCode('$value');
};
const getPrimitiveAttr = () => {
    insertCode('$primitive.getAttr("")');
};
const setPrimitiveAttr = () => {
    insertCode('$primitive.setAttr("", "")');
};
const getBoardAttr = () => {
    insertCode('$board.getAttr("")');
};
const setBoardAttr = () => {
    insertCode('$board.setAttr("", "")');
};
const timeout = () => {
    insertCode('$setTimeout(() => {}, 1000)');
};
const interval = () => {
    insertCode('$setInterval(() => {}, 1000)');
};

const setCustomComplete = editor => {
    const customCompletion = [
        {
            name: '$value',
            value: '$value',
            score: 100,
            meta: t('vis.scriptEditor.rawValue'),
        },
        {
            name: '$primitive.getAttr',
            value: '$primitive.getAttr',
            score: 100,
            meta: t('vis.scriptEditor.getPrimitiveAttr'),
        },
        {
            name: '$primitive.setAttr',
            value: '$primitive.setAttr',
            score: 100,
            meta: t('vis.scriptEditor.setPrimitiveAttr'),
        },
        {
            name: '$board.getAttr',
            value: '$board.getAttr',
            score: 100,
            meta: t('vis.scriptEditor.getBoardAttr'),
        },
        {
            name: '$board.setAttr',
            value: '$board.setAttr',
            score: 100,
            meta: t('vis.scriptEditor.setBoardAttr'),
        },
        {
            name: '$setTimeout',
            value: '$setTimeout',
            score: 100,
            meta: t('vis.scriptEditor.setTimeout'),
        },
        {
            name: '$setInterval',
            value: '$setInterval',
            score: 100,
            meta: t('vis.scriptEditor.setInterval'),
        },
    ];
    editor.completers.push({
        getCompletions: (editor, session, pos, prefix, callback) => {
            callback(null, customCompletion);
        },
    });
};

onMounted(() => {
    // eslint-disable-next-line
    editor = ace.edit(editorWrap.value, {
        value: props.modelValue,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
    });
    setCustomComplete(editor);
    editor.setTheme('ace/theme/chrome');
    const session = editor.getSession();
    session.setMode('ace/mode/javascript');
    editor.focus();
    const count = session.getLength();
    editor.gotoLine(count, session.getLine(count - 1).length);
    editor.on('change', () => {
        emit('update:modelValue', editor.getValue());
    });
});
</script>
