<template>
    <cv-dialog-form
        v-model="visible"
        :title="props.title"
        :form-model="formData"
        custom-class="vis-board-dialog"
        :rules="props.rules"
        :submit="submit"
    >
        <cv-form-item :label="t('vis.configuration.boardName')" prop="boardName">
            <cv-input v-model="formData.boardName"></cv-input>
        </cv-form-item>
    </cv-dialog-form>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

defineOptions({name: 'BoardDialog'});

interface IForm {
    boardName: string;
    boardId?: string;
}

interface IProps {
    form: IForm;
    title: string;
    rules: Record<string, Array<any>>;
    submit: (form: IForm) => boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    form() {
        return {
            boardName: '',
        };
    },
});

const emits = defineEmits(['update:formModel', 'submit']);

const visible = ref(false);

const formData = computed<IForm>({
    get() {
        return props.form;
    },
    set(val) {
        emits('update:formModel', val);
    },
});

const submit = () => {
    return props.submit?.(formData.value);
};

defineExpose({
    open() {
        visible.value = true;
    },
});
</script>
