<template>
    <div class="device-detail">
        <card :title="t('fw.overview.basicInfo')" :config="siteConfig"></card>
        <grid-data :title="t('fw.overview.IODevice')" :col="3" :item-height="48" :data="IOData"></grid-data>
        <grid-data
            :title="t('fw.overview.fireProtectionSystem')"
            :col="2"
            :item-height="48"
            :data="fireSystem"
        ></grid-data>
        <card :title="t('fw.overview.pcsDevice')" :config="PCSDevice"></card>
    </div>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import Card from './card.vue';
import GridData from './grid-data.vue';
import {alarmStatus, commonStatus, communicationStatus, doorStatus, scramButtonStatus} from './status';

const {t} = useLocale();
const siteConfig = ref([
    {
        label: t('fw.overview.deviceName'),
        value: '1',
    },
    {
        label: t('fw.overview.deviceSN'),
        value: '1',
    },
    {
        label: t('fw.overview.deviceModel'),
        value: '1',
    },
    {
        label: t('fw.overview.channel'),
        value: '1',
    },
]);
const IOData = ref([
    {
        label: t('fw.deviceDataLabel.fireFightingEquipment'),
        value: 0,
        statusDict: alarmStatus,
    },
    {
        label: t('fw.deviceDataLabel.smokeSensor'),
        value: 0,
        statusDict: alarmStatus,
    },
    {
        label: t('fw.deviceDataLabel.tempSensor'),
        value: 0,
        statusDict: alarmStatus,
    },
    {
        label: t('fw.deviceDataLabel.waterImmersionSensor'),
        value: 1,
        statusDict: alarmStatus,
    },
    {
        label: t('fw.deviceDataLabel.doorStatus'),
        value: 0,
        statusDict: doorStatus,
    },
    {
        label: t('fw.deviceDataLabel.scramButton'),
        value: 0,
        statusDict: scramButtonStatus,
    },
]);
const fireSystem = ref([
    {
        label: t('fw.deviceDataLabel.runningState'),
        value: 0,
        statusDict: commonStatus,
    },
    {
        label: t('fw.deviceDataLabel.alarmStatus'),
        value: 1,
        statusDict: alarmStatus,
        canClick: true,
    },
    {
        label: t('fw.deviceDataLabel.faultStatus'),
        value: 0,
        statusDict: commonStatus,
    },
    {
        label: t('fw.deviceDataLabel.communicationStatus'),
        value: 2,
        statusDict: communicationStatus,
    },
]);
const PCSDevice = ref([
    {
        label: t('fw.deviceDataLabel.runningState'),
        value: 0,
        statusDict: commonStatus,
    },
    {
        label: t('fw.deviceDataLabel.faultStatus'),
        value: 0,
        statusDict: commonStatus,
    },
    {
        label: t('fw.deviceDataLabel.alarmStatus'),
        value: 1,
        statusDict: alarmStatus,
        canClick: true,
    },
    {
        label: t('fw.deviceDataLabel.communicationStatus'),
        value: 2,
        statusDict: communicationStatus,
    },
    {
        label: t('fw.deviceDataLabel.activePower'),
        value: 3,
        unit: 'kWh',
    },
    {
        label: t('fw.deviceDataLabel.reactivePower'),
        value: 3,
        unit: 'kVar',
    },
    {
        label: t('fw.deviceDataLabel.IGBTTemperature'),
        value: 3,
        unit: '℃',
    },
]);
</script>
<style scoped lang="scss">
.device-detail {
    padding: 0 16px 16px;
}
</style>
