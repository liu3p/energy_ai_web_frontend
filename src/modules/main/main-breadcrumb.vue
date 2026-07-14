<template>
    <div class="breadcrumb">
        {{ route.meta.title}}
    </div>
</template>
<script setup lang="ts">
import {useRoute} from 'vue-router';

const route = useRoute();

</script>
<style scoped lang="scss">
.breadcrumb {
    width: 100%;
    height: 32px;
    margin: 12px 16px 0;
    display: flex;
    align-items: center;
    color: #35353E;
    font-weight: 700;
    font-size: 16px;
}
</style>