<template>
    <cv-select v-model="value">
        <cv-option v-for="option in options" :value="option">
            <div class="vis-line-arrow-select__option">
                {{ option.label }}
                <span class="vis-line-arrow-select__option-label">{{ option.value }}</span>
            </div>
        </cv-option>
        <template #prefix>
            {{ options.find(item => item.value === value)?.label }}
        </template>
    </cv-select>
</template>
<script lang="ts" setup>
import {computed, shallowReactive} from 'vue';

defineOptions({
    name: 'VisLineArrowSelect',
});
const props = defineProps<{
    modelValue: string;
}>();
const emit = defineEmits(['update:modelValue']);
const value = computed({
    get: () => {
        return props.modelValue;
    },
    set: value => {
        emit('update:modelValue', value);
    },
});
const options = shallowReactive([
    {
        value: '0',
        label: '无',
    },
    {
        value: '1',
        label: '',
    },
]);
</script>
