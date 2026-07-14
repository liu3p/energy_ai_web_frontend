<template>
    <div class="overview">
        <div class="overview__header">
            <div class="overview__header-item">
                <p>电站总数/告警数量</p>
                <p>2000 个 / 10 条</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup></script>
<style lang="scss" scoped>
.overview {
    &__header {
        height: 92px;
        padding: 24px 40px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);

        &-item {
            display: flex;
            justify-content: space-between;
            width: 420px;
            height: 44px;
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            align-items: center;
            padding: 0 24px 0 12px;
        }
    }
}
</style>
