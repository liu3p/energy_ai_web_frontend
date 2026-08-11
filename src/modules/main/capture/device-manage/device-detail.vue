<template>
    <div class="device-detail">
        <div class="device-detail__preview">
            <div class="device-detail__image">
                <img :src="deviceIcon" :alt="typeLabel" class="device-detail__icon" />
            </div>
        </div>
        <div class="device-detail__cards">
            <section
                v-for="group in paramGroups"
                :key="group.title"
                class="param-group"
            >
                <div class="param-group__title">{{ group.title }}</div>
                <div v-if="group.items.length" class="param-group__grid">
                    <div v-for="item in group.items" :key="item.key" class="param-card">
                        <div class="param-card__label">{{ item.label }}</div>
                        <div class="param-card__value">
                            {{ formatValue(item) }}
                        </div>
                        <cv-button
                            v-if="group.showDispatch"
                            type="primary"
                            size="small"
                            class="param-card__action"
                            @click="emit('dispatch', item)"
                        >
                            {{ t('fw.deviceManage.dispatch.dispatch') }}
                        </cv-button>
                    </div>
                </div>
                <div v-else class="param-group__empty">{{ t('fw.deviceManage.noData') }}</div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import type {DeviceTreeNode, ParamCardItem} from './device-manage.types';
import {buildParamCardGroups, formatParamCardValue, getDeviceIcon, getTypeLabel} from './station-model.util';

const {t} = useLocale();

const props = defineProps<{
    node: DeviceTreeNode;
}>();

const emit = defineEmits<{
    dispatch: [param: ParamCardItem];
}>();

const typeLabel = computed(() => getTypeLabel(props.node.type));
const deviceIcon = computed(() => getDeviceIcon(props.node.type, props.node.name));
const paramGroups = computed(() => buildParamCardGroups(props.node.para, props.node.dyn_para));

function formatValue(item: ParamCardItem): string {
    return formatParamCardValue(item);
}
</script>

<style scoped lang="scss">
.device-detail {
    display: flex;
    gap: 24px;
    height: 100%;
    padding: 24px;
    background: #fff;
    border-radius: 12px;
    overflow: auto;
}

.device-detail__preview {
    flex: 0 0 280px;
}

.device-detail__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 430px;
    height: 730px;
    padding: 24px;
    border-radius: 12px;
    background: linear-gradient(145deg, #f5f7fb 0%, #e8edf5 100%);
    border: 1px solid #eef1f6;
}

.device-detail__icon {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.device-detail__cards {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.param-group {
    width: 100%;
    flex-shrink: 0;
}

.param-group__title {
    margin-bottom: 12px;
    color: #35353e;
    font-size: 15px;
    font-weight: 700;
}

.param-group__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
}

.param-group__empty {
    padding: 24px 0;
    color: #98a3be;
    font-size: 14px;
}

.param-card {
    position: relative;
    min-height: 130px;
    padding: 16px;
    border-radius: 12px;
    background: #f8f9fc;
    border: 1px solid #eef1f6;
}

.param-card__label {
    font-size: 14px;
    color: #667085;
    margin-bottom: 12px;
}

.param-card__value {
    font-size: 28px;
    font-weight: 700;
    color: #35353e;
    line-height: 1.2;
}

.param-card__action {
    position: absolute;
    right: 16px;
    bottom: 16px;
}
</style>
