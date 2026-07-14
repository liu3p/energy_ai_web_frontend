<template>
    <div class="container">
        <div class="network-param">
            <div class="network-param__header">
                <span>设备参数</span>
                <span>
                    <cv-button>编辑</cv-button>
                </span>
            </div>
            <div class="network-param__contain">
                <div class="form-item">
                    <div class="label">序列号</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">设备型号</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">主机名</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">当前时间</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">时区</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
}
.network-param {
    width: 100%;
    height: 142px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    &__header {
        height: 48px;
        background: #fff;
        padding: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #EBEBEB;
    }
    &__contain {
        background: #fff;
        height: calc(100% - 48px);
        padding: 16px;
        overflow: hidden;
        display: grid;
        grid-template-columns: repeat(5,1fr);
        gap: 50px;
        .label {
            color: #1A1A1A;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 4px;
        }
    }
}
</style>