<template>
    <div class="strategy-section">
        <div class="strategy-section__header" @click="expanded = !expanded">
            <span class="strategy-section__arrow" :class="{expanded}">›</span>
            <span class="strategy-section__title">{{ section.title }}</span>
            <span class="strategy-section__status" :class="section.active ? 'is-active' : 'is-inactive'">
                {{
                    section.active
                        ? t('fw.operationStrategy.status.active')
                        : t('fw.operationStrategy.status.inactive')
                }}
            </span>
        </div>
        <div v-show="expanded" class="strategy-section__body">
            <div class="strategy-block">
                <div class="strategy-block__title">{{ t('fw.operationStrategy.block.runValues') }}</div>
                <cv-table :data="section.runValues" style="width: 100%">
                    <cv-table-column type="index" :label="t('fw.common.number')" width="70" :index="indexMethod" />
                    <cv-table-column prop="name" :label="t('fw.operationStrategy.column.name')" min-width="160" />
                    <cv-table-column :label="t('fw.operationStrategy.column.value')" min-width="140">
                        <template #default="{row}">
                            {{ formatRunValueDisplay(row) }}
                        </template>
                    </cv-table-column>
                    <cv-table-column :label="t('fw.operationStrategy.column.dataType')" align="center">
                        <template #default="{row}">
                            <span class="strategy-cell-tag strategy-data-type-tag">{{ getDataTypeLabel(row.dataType) }}</span>
                        </template>
                    </cv-table-column>
                    <cv-table-column :label="t('fw.operationStrategy.column.controllable')" align="center">
                        <template #default="{row}">
                            <span
                                class="strategy-cell-tag strategy-controllable-tag"
                                :class="row.controllable ? 'is-yes' : 'is-no'"
                            >
                                {{
                                    row.controllable
                                        ? t('fw.operationStrategy.yes')
                                        : t('fw.operationStrategy.no')
                                }}
                            </span>
                        </template>
                    </cv-table-column>
                    <!-- <cv-table-column :label="t('fw.operationStrategy.column.dispatchControl')">
                        <template #default="{row}">
                            <cv-button
                                v-if="row.dispatchable"
                                link
                                type="primary"
                                @click="emit('dispatch', section.id, row)"
                            >
                                {{ t('fw.operationStrategy.column.dispatchControl') }}
                            </cv-button>
                            <span v-else class="strategy-section__muted">--</span>
                        </template>
                    </cv-table-column> -->
                </cv-table>
            </div>

            <div class="strategy-block">
                <div class="strategy-block__title">{{ t('fw.operationStrategy.block.paramValues') }}</div>
                <cv-table :data="section.paramValues" style="width: 100%">
                    <cv-table-column type="index" :label="t('fw.common.number')" width="70" :index="indexMethod" />
                    <cv-table-column prop="name" :label="t('fw.operationStrategy.column.name')" min-width="160" />
                    <cv-table-column :label="t('fw.operationStrategy.column.value')" min-width="140">
                        <template #default="{row}">
                            {{ formatParamValueDisplay(row.value) }}
                        </template>
                    </cv-table-column>
                    <cv-table-column prop="range" :label="t('fw.operationStrategy.column.range')" min-width="140" />
                    <cv-table-column
                        prop="description"
                        :label="t('fw.operationStrategy.column.description')"
                        min-width="220"
                    />
                </cv-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import type {StrategyParamValue, StrategyRunValue, StrategySection} from './operation-strategy.types';
import {formatParamValueDisplay, formatRunValueDisplay, getDataTypeLabel} from './strategy.util';

const {t} = useLocale();

defineProps<{
    section: StrategySection;
}>();

const emit = defineEmits<{
    dispatch: [sectionId: string, runValue: StrategyRunValue];
}>();

const expanded = ref(false);

function indexMethod(index: number) {
    return String(index + 1).padStart(2, '0');
}
</script>

<style scoped lang="scss">
.strategy-section {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
}

.strategy-section + .strategy-section {
    margin-top: 16px;
}

.strategy-section__header {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 56px;
    padding: 0 20px;
    background: #edf3ff;
    cursor: pointer;
    user-select: none;
}

.strategy-section__arrow {
    display: inline-flex;
    width: 16px;
    color: #3162e1;
    font-size: 18px;
    transform: rotate(90deg);
    transition: transform 0.2s ease;

    &.expanded {
        transform: rotate(-90deg);
    }
}

.strategy-section__title {
    flex: 1;
    color: #35353e;
    font-size: 16px;
    font-weight: 700;
}

.strategy-section__status {
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;

    &.is-active {
        color: #3162e1;
        background: #fff;
    }

    &.is-inactive {
        color: #98a3be;
        background: rgba(255, 255, 255, 0.8);
    }
}

.strategy-section__body {
    padding: 20px;
}

.strategy-block + .strategy-block {
    margin-top: 24px;
}

.strategy-block__title {
    margin-bottom: 12px;
    color: #35353e;
    font-size: 15px;
    font-weight: 700;
}

.strategy-section__muted {
    color: #98a3be;
}

:deep(.strategy-cell-tag) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 52px;
    height: 28px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
}

:deep(.strategy-data-type-tag) {
    color: #35353e;
    background: #f2f4f8;
}

:deep(.strategy-controllable-tag.is-yes) {
    color: #fff;
    background: #4f5563;
    min-width: 30px;
    padding: 2px;
}

:deep(.strategy-controllable-tag.is-no) {
    color: #98a3be;
    background: #f2f4f8;
}
</style>
