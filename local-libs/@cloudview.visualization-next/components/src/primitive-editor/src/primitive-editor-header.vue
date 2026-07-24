<template>
    <div class="vis-primitive-editor-header">
        <div class="vis-primitive-editor-header__title">
            {{ props.title }}
        </div>
        <div class="vis-primitive-editor-header__ops">
            <div class="vis-primitive-editor-header__ops-item">
                <cv-button type="primary" text @click="definition"
                    >{{ t('vis.primitive.primitiveDefinition') }}
                </cv-button>
            </div>
            <div class="vis-primitive-editor-header__ops-item">
                <cv-button type="primary" text :disabled="!props.saveEnabled" @click="save">
                    {{ t('vis.common.save') }}
                </cv-button>
            </div>
            <div class="vis-primitive-editor-header__ops-item">
                <cv-button type="primary" text @click="back">{{ t('vis.common.goBack') }}</cv-button>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {useRouter} from 'vue-router';

defineOptions({name: 'VisPrimitiveEditor'});
const props = defineProps<{
    title: string;
    saveEnabled: boolean;
}>();
const emit = defineEmits(['save', 'definition']);

const router = useRouter();
const {t} = useLocale();
const definition = () => {
    emit('definition');
};
const save = () => {
    emit('save');
};
const back = () => {
    router.back();
};
</script>
