<template>
    <cv-sidebar
        :always-show-toggle-button="true"
        background-color="#ffffff"
        :collapse-width="collapseWidth"
        :width="width"
        @collapse="emit('update:modelValue', true)"
        @extend="emit('update:modelValue', false)"
        style="padding: 16px;height: 100%"
    >
        <div v-show="modelValue" class="collapse-container"></div>
        <div v-show="!modelValue" class="collapse-container">
            <cv-scrollbar height="100%">
                <slot></slot>
            </cv-scrollbar>
        </div>
    </cv-sidebar>
</template>

<script setup lang="ts">
defineProps(['modelValue','width','collapseWidth'])
const emit = defineEmits(['update:modelValue'])

</script>

<style scoped lang="scss">
.collapse-container {
    height: 100%;
}

</style>
