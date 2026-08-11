<template>
    <cv-dialog v-model="visible" :title="t('fw.operationStrategy.dispatch.title')" width="560px" @close="handleClose">
        <p class="dispatch-dialog__tip">{{ t('fw.operationStrategy.dispatch.tip') }}</p>
        <div class="dispatch-dialog__info">
            <div class="dispatch-dialog__info-item">
                <span class="label">{{ t('fw.operationStrategy.dispatch.paramName') }}</span>
                <span class="value">{{ currentTarget?.runValue.name ?? '--' }}</span>
            </div>
            <div class="dispatch-dialog__info-item">
                <span class="label">{{ t('fw.operationStrategy.dispatch.dataType') }}</span>
                <span class="value">{{ displayDataType }}</span>
            </div>
            <div class="dispatch-dialog__info-item">
                <span class="label">{{ t('fw.operationStrategy.dispatch.currentValue') }}</span>
                <span class="value">{{ displayCurrentValue }}</span>
            </div>
        </div>
        <cv-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <cv-form-item :label="t('fw.operationStrategy.dispatch.targetValue')" prop="value" required>
                <cv-select
                    v-if="hasOptions"
                    v-model="formData.value"
                    :placeholder="t('fw.operationStrategy.dispatch.pleaseSelectTargetValue')"
                    style="width: 100%"
                >
                    <cv-option
                        v-for="option in currentTarget?.runValue.options"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                    />
                </cv-select>
                <cv-input-number
                    v-else-if="hasNumericRange"
                    v-model="numericValue"
                    :min="Number(currentTarget?.runValue.min)"
                    :max="Number(currentTarget?.runValue.max)"
                    style="width: 100%"
                />
                <cv-input
                    v-else
                    v-model="formData.value"
                    :placeholder="t('fw.operationStrategy.dispatch.pleaseInputTargetValue')"
                />
                <div v-if="dispatchHint" class="dispatch-dialog__hint">
                    {{ dispatchHint }}
                </div>
            </cv-form-item>
            <cv-form-item
                :label="t('fw.personalCenter.loginPwd') + t('fw.common.colon')"
                prop="checkpwd"
                required
            >
                <cv-input
                    v-model="formData.checkpwd"
                    type="password"
                    show-password
                    :placeholder="t('fw.deviceManage.dispatch.pleaseInputLoginPwd')"
                />
            </cv-form-item>
        </cv-form>
        <template #footer>
            <cv-button @click="handleClose">{{ t('fw.common.cancel') }}</cv-button>
            <cv-button type="primary" :loading="loading" @click="handleSubmit">
                {{ t('fw.operationStrategy.dispatch.confirmDispatch') }}
            </cv-button>
        </template>
    </cv-dialog>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue';
import {CvMessage, useLocale} from 'cloudview.ui-next';
import type {DispatchTarget} from './operation-strategy.types';
import {dispatchStrategyRunValue} from './operation-strategy.service';
import {formatDispatchHint, formatRunValueDisplay, getDataTypeLabel} from './strategy.util';

const {t} = useLocale();

const emit = defineEmits<{
    success: [target: DispatchTarget, value: string];
}>();

const visible = defineModel<boolean>({default: false});
const loading = ref(false);
const formRef = ref();
const currentTarget = ref<DispatchTarget | null>(null);

const formData = reactive({
    value: '',
    checkpwd: '',
});

const hasOptions = computed(() => (currentTarget.value?.runValue.options?.length ?? 0) > 0);
const hasNumericRange = computed(() => {
    const item = currentTarget.value?.runValue;
    return !!item?.min && !!item?.max && item.dataType === 'float';
});
const numericValue = computed({
    get: () => Number(formData.value || 0),
    set: (val: number) => {
        formData.value = String(val);
    },
});

const dispatchHint = computed(() => {
    const item = currentTarget.value?.runValue;
    if (!item) {
        return '';
    }
    return formatDispatchHint(item);
});

const displayDataType = computed(() => {
    const item = currentTarget.value?.runValue;
    if (!item) {
        return '--';
    }
    return getDataTypeLabel(item.dataType);
});

const displayCurrentValue = computed(() => {
    const item = currentTarget.value?.runValue;
    if (!item) {
        return '--';
    }
    return formatRunValueDisplay(item);
});

const rules = computed(() => ({
    value: [
        {
            required: true,
            message: t('fw.operationStrategy.dispatch.pleaseInputOrSelectTargetValue'),
            trigger: 'change',
        },
    ],
    checkpwd: [{required: true, message: t('fw.deviceManage.dispatch.pleaseInputLoginPwd'), trigger: 'blur'}],
}));

watch(visible, val => {
    if (!val) {
        currentTarget.value = null;
        formData.value = '';
        formData.checkpwd = '';
    }
});

function open(target: DispatchTarget) {
    currentTarget.value = target;
    formData.value = target.runValue.value;
    formData.checkpwd = '';
    visible.value = true;
}

function handleClose() {
    visible.value = false;
}

async function handleSubmit() {
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid || !currentTarget.value) {
        return;
    }
    loading.value = true;
    const res = await dispatchStrategyRunValue(currentTarget.value.runValue, formData.value, formData.checkpwd);
    loading.value = false;
    if (res.state) {
        CvMessage.success(t('fw.operationStrategy.dispatch.dispatchSuccess'));
        emit('success', currentTarget.value, formData.value);
        handleClose();
    } else {
        CvMessage.error(res.message ?? t('fw.operationStrategy.dispatch.dispatchFailed'));
    }
}

defineExpose({open});
</script>

<style scoped lang="scss">
.dispatch-dialog__tip {
    margin: 0 0 16px;
    color: #667085;
    font-size: 14px;
}

.dispatch-dialog__info {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 20px;
    padding: 16px;
    border-radius: 8px;
    background: #f8f9fc;
}

.dispatch-dialog__info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .label {
        color: #98a3be;
        font-size: 13px;
    }

    .value {
        color: #35353e;
        font-size: 14px;
        font-weight: 600;
    }
}

.dispatch-dialog__hint {
    margin-top: 8px;
    color: #98a3be;
    font-size: 12px;
}
</style>
