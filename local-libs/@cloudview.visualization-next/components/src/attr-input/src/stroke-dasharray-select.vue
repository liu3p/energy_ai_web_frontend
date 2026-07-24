<template>
    <cv-select v-model="value" filterable allow-create>
        <cv-option v-for="option in options" :value="option">
            <div class="vis-stroke-dasharray__option">
                <svg width="80" height="20">
                    <line
                        stroke="#000"
                        :stroke-dasharray="option"
                        stroke-width="2"
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                    ></line>
                </svg>
                <span class="vis-stroke-dasharray__option-label">{{ option }}</span>
            </div>
        </cv-option>
        <template #prefix>
            <svg width="80" height="20">
                <line
                    stroke="#000"
                    :stroke-dasharray="value"
                    stroke-width="2"
                    x1="0"
                    y1="50%"
                    x2="100%"
                    y2="50%"
                ></line>
            </svg>
        </template>
    </cv-select>
</template>
<script lang="ts" setup>
import {computed, reactive, watch} from 'vue';

defineOptions({
    name: 'VisStrokeDasharraySelect',
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
const options = reactive(['0 0', '2 2', '5 5', '10 10', '15 15']);

watch(
    () => props.modelValue,
    value => {
        if (value !== '' && !options.includes(value)) {
            options.unshift(value);
        }
    },
    {
        immediate: true,
    }
);
</script>
