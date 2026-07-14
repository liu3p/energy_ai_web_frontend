<template>
    <div class="main-tool">
        <div>
            <slot></slot>
        </div>
        <div>
            <slot name="end"></slot>
        </div>
    </div>
</template>
<script lang="ts" setup></script>
<style lang="scss" scoped>
.main-tool {
    height: 70px;
    margin-bottom: var(--fw-gap);
    display: flex;
    justify-content: space-between;
}
</style>
