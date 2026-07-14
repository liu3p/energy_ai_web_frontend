<template>
    <main-header></main-header>

    <div class="main-body flex-colum">
        <main-tool>
            <cv-input :placeholder="t('fw.menuManage.pleaseInputMenuName')"></cv-input>
            <template #end>
                <cv-button type="primary">{{ t('fw.menuManage.addMenu') }}</cv-button>
            </template>
        </main-tool>
    </div>
</template>

<script lang="ts" setup>
import MainHeader from '../../common/main-header.vue';
import MainTool from '../../common/main-tool.vue';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();
</script>
