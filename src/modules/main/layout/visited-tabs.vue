<template>
    <div class="visited-tabs">
        <div v-if="tabs.length" class="visited-tabs__list">
            <button
                v-for="item in tabs"
                :key="item.path"
                class="visited-tabs__item"
                :class="{'is-active': item.path === activePath}"
                type="button"
                @click="openTab(item.path)"
            >
                <span class="visited-tabs__label">{{ tabLabel(item) }}</span>
                <span
                    v-if="item.closable"
                    class="visited-tabs__close"
                    @click.stop="closeTab(item.path)"
                >
                    ×
                </span>
            </button>
        </div>
        <button
            class="visited-tabs__refresh"
            type="button"
            :title="t('fw.common.refresh')"
            @click="refreshCurrent"
        >
            <cv-icon :size="16">
                <Refresh />
            </cv-icon>
            <span>{{ t('fw.common.refresh') }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import {Refresh} from '@element-plus/icons-vue';
import {useLocale} from 'cloudview.ui-next';
import {useVisitedTabs, type VisitedTab} from './visited-tabs';

const {t} = useLocale();
const {tabs, activePath, openTab, closeTab, refreshCurrent} = useVisitedTabs();

function tabLabel(item: VisitedTab) {
    return item.titleKey ? t(item.titleKey) : item.titleFallback;
}
</script>

<style scoped lang="scss">
.visited-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    width: 100%;
}

.visited-tabs__list {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    overflow-x: auto;
    padding: 2px 0;
    flex: 1;

    &::-webkit-scrollbar {
        height: 0;
    }
}

.visited-tabs__item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid #dbe1ea;
    border-radius: 6px;
    background: #fff;
    color: #5c6373;
    font-size: 13px;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
        color: #3162e1;
        border-color: #c5d4f5;
    }

    &.is-active {
        color: #fff;
        background: #3162e1;
        border-color: #3162e1;
    }
}

.visited-tabs__close {
    font-size: 14px;
    line-height: 1;
    opacity: 0.7;

    &:hover {
        opacity: 1;
    }
}

.visited-tabs__refresh {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid #dbe1ea;
    border-radius: 6px;
    background: #fff;
    color: #5c6373;
    font-size: 13px;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
        color: #3162e1;
        border-color: #c5d4f5;
    }
}
</style>
