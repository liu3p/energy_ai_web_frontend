<template>
    <cv-dialog-form
        v-model="visible"
        label-position="top"
        :form-model="formModel"
        size="medium"
        custom-class="vis-obj-definition-dialog"
        :title="props.title"
        :submit="props.submit"
        :rules="rules"
        :submit-text="props.submitText"
    >
        <div
            class="vis-obj-definition-dialog__container"
            tabindex="2"
            @keydown.ctrl.z.exact.stop
            @keydown.ctrl.y.exact.stop
            @keydown.ctrl.shift.z.exact.stop
            @keydown.meta.z.exact.stop
            @keydown.meta.y.exact.stop
            @keydown.meta.shift.z.exact.stop
        >
            <div v-if="props.isPrimitive" class="vis-obj-definition-dialog__upload">
                <cv-form-item prop="model_id" :label="t('vis.primitive.primitive')">
                    <cv-upload
                        ref="upload"
                        class="vis-obj-definition-dialog__upload-box"
                        :drag="false"
                        action=""
                        :accept="fileType"
                        :show-file-list="false"
                        :on-change="beforeUpload"
                        :http-request="uploadImg"
                        :disabled="props.uploadDisabled"
                    >
                        <img v-if="imgUrl" class="vis-obj-definition-dialog__thumb-img" :src="imgUrl" />
                        <cv-icon v-else :size="26">
                            <cv-icon-upload></cv-icon-upload>
                        </cv-icon>
                    </cv-upload>
                </cv-form-item>
                <cv-button v-if="!props.uploadDisabled" type="primary" link @click="selectFile">
                    {{ t('vis.primitive.uploadPrimitive') }}
                </cv-button>
            </div>
            <div class="vis-obj-definition-dialog__info-box">
                <div class="vis-obj-definition-dialog__info-line">
                    <cv-form-item prop="name" :label="t('vis.common.objectName', objName)">
                        <cv-input v-model.lazyTrim="formModel.name"></cv-input>
                    </cv-form-item>
                    <cv-form-item prop="tag" :label="t('vis.common.objectGroup', objName)">
                        <cv-select v-model="formModel.tag" filterable allow-create default-first-option>
                            <cv-option
                                v-for="item in tags"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></cv-option>
                        </cv-select>
                    </cv-form-item>
                </div>
                <div class="vis-obj-definition-dialog__info-line">
                    <cv-form-item v-if="props.isPrimitive" prop="type" :label="t('vis.primitive.primitiveType')">
                        <cv-select v-model="formModel.type" :disabled="props.isEdit" @change="typeChanged">
                            <cv-option
                                v-for="item in primitiveTypes"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></cv-option>
                        </cv-select>
                    </cv-form-item>
                    <cv-form-item prop="engine_type" :label="t('vis.common.engineType')">
                        <cv-select
                            v-model="formModel.engine_type"
                            filterable
                            allow-create
                            default-first-option
                            :disabled="props.isEdit"
                        >
                            <cv-option
                                v-for="item in engineTypes"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></cv-option>
                        </cv-select>
                    </cv-form-item>
                    <cv-form-item v-if="!props.isPrimitive" prop="description" :label="t('vis.common.description')">
                        <cv-input v-model="formModel.description"></cv-input>
                    </cv-form-item>
                </div>
                <cv-form-item v-if="props.isPrimitive" prop="description" :label="t('vis.common.description')">
                    <cv-input v-model="formModel.description"></cv-input>
                </cv-form-item>
            </div>
        </div>
    </cv-dialog-form>
</template>
<script lang="ts" setup>
import defaultProps from './props';
import {computed, reactive, ref, watch} from 'vue';
import {CvNotification, useLocale} from 'cloudview.ui-next';
import type {IConfiguration, IObjectRes, IOption, IPrimitive} from '@cloudview.visualization-next/services';
import {
    getEngineTypes,
    getPrimitiveTypes,
    ObjectApi,
    PrimitiveTypeAllEnum,
    StringUtils,
    Utils,
} from '@cloudview.visualization-next/services';
import {CvIconUpload} from 'cloudview.ui-next-icon';

const {t} = useLocale();

defineOptions({name: 'ObjDefinitionDialog'});
const emits = defineEmits(['update:formModel']);
const props = defineProps(defaultProps);
const visible = ref(false);
const tags = reactive<IOption[]>([]);
const primitiveTypes = getPrimitiveTypes();
const engineTypes = getEngineTypes(false);
const upload = ref();

const getTags = async () => {
    const res = await props.getTags?.();
    if (res?.state) {
        tags.length = 0;
        tags.push(
            ...res.data
                .filter(item => !StringUtils.isEmpty(item))
                .map(item => {
                    return {
                        label: item,
                        value: item,
                    };
                })
        );
    }
};

const formModel = computed<IConfiguration | IPrimitive>({
    get(): IConfiguration | IPrimitive {
        return props.formModel!;
    },
    set(val) {
        emits('update:formModel', val);
    },
});

const imgUrl = ref('');

const fileType = computed(() => {
    const formInfo = formModel.value as IPrimitive;
    if (formInfo.type === PrimitiveTypeAllEnum.SVG) {
        return '.svg';
    }
    return '.jpg, .png, .jpeg, .gif, .webp';
});

const objName = computed(() => {
    return props.isPrimitive ? {0: t('vis.primitive.primitive')} : {0: t('vis.configuration.configuration')};
});

const getObjectSrc = async () => {
    const formInfo = formModel.value as IPrimitive;
    const resFile = await ObjectApi.getFile(formInfo.model_id);
    if (resFile.state) {
        const data = resFile.data as File;
        if (formInfo.type === PrimitiveTypeAllEnum.SVG) {
            const svgContent = await Utils.readSvgFile(data);
            imgUrl.value = Utils.svgString2Base64Img(svgContent);
        } else {
            imgUrl.value = await Utils.image2Base64(data);
        }
    }
};

const beforeUpload = file => {
    const rawFile = file.raw;
    return fileType.value.includes(rawFile.name.substring(rawFile.name.lastIndexOf('.') + 1));
};

const uploadImg = async item => {
    if (fileType.value.includes(item.file.name.substring(item.file.name.lastIndexOf('.') + 1))) {
        const res = await ObjectApi.postFile(item.file);
        if (res.state) {
            const formInfo = formModel.value as IPrimitive;
            formInfo.model_id = (res.data as IObjectRes).id;
        }
    } else {
        CvNotification.warning({
            title: t('vis.message.fileTypeError'),
            message: t('vis.message.selectRightFileType', {0: fileType.value}),
        });
    }
};

const typeChanged = val => {
    imgUrl.value = '';
};

const selectFile = () => {
    const input = upload.value.$el.querySelector('.el-upload__input');
    input.click();
};

const open = () => {
    visible.value = true;
    getTags();
};

const rules = {
    name: [
        {required: true, message: t('vis.validate.nameIsEmpty')},
        {
            async validator(rule, val, cb) {
                val = val.trim();
                if (val.length > 40) return cb(t('vis.validate.nameTooLong'));
                if (val.match(/^[0-9a-zA-Z\-_\u4e00-\u9fa5]{0,40}$/)) {
                    const res = await props.checkName!(val, formModel.value.id);
                    if (res.state) {
                        if (res.data.exist) {
                            return cb(t('vis.validate.nameExist'));
                        }
                    }
                    return cb();
                }
                return cb(t('vis.validate.nameInvalid'));
            },
            trigger: 'blur',
        },
    ],
    tag: [
        {
            validator(rule, val, cb) {
                val = val.trim();
                if (val.length > 40) return cb(t('vis.validate.tagTooLong'));
                return cb();
            },
        },
    ],
    model_id: [
        {
            required: props.isPrimitive,
            message: t('vis.validate.modelIsEmpty'),
        },
    ],
};

watch(
    () => (formModel.value as IPrimitive)?.model_id,
    async (newVal, oldVal) => {
        if (!imgUrl.value && newVal) {
            await getObjectSrc();
        } else if (newVal !== oldVal) {
            if (newVal) {
                await getObjectSrc();
            } else {
                imgUrl.value = '';
            }
        }
    },
    {deep: true}
);

defineExpose({open});
</script>
