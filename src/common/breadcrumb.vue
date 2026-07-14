<template>
    <div class="breadcrumb">
        <span
            v-for="(item, index) in props.config.slice(0, -1)"
            :key="index"
            class="breadcrumb-parent"
            :class="{'breadcrumb-can-click': !!item.path}"
            @click="handleClick(item.path)"
        >
            {{ item.label }}/
        </span>
        <span class="breadcrumb-current">
            {{ props.config.slice(-1)[0]?.label }}
        </span>
    </div>
</template>
<script setup lang="ts">
import router from '@/router';
const props = defineProps<{config: {path?: string; label: string}[]}>();

const handleClick = (path?: string) => {
    if (path) {
        router.replace(path);
    }
};
</script>

<style scoped lang="scss">
.breadcrumb {
    &-parent {
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
        color: rgb(53 53 62 / 40%);
        padding-left: 8px;
    }
    &-can-click {
        cursor: pointer;
    }

    &-current {
        font-size: 16px;
        font-weight: 700;
        line-height: 16px;
        color: #35353e;
    }
}
</style>
