<template>
    <div class="vis-configuration-browser">
        <div class="vis-configuration-browser__tools">
            <div class="vis-configuration-browser__title">{{ configurationConfig?.name }}</div>
            <div class="vis-configuration-browser__buttons">
                <div class="vis-configuration-browser__operation">
                    <cv-button type="primary" text @click="jumpToEdit()">
                        {{ t('vis.common.edit') }}
                    </cv-button>
                </div>

                <div class="vis-configuration-browser__operation">
                    <cv-button type="primary" text @click="defDialog?.open">
                        {{ t('vis.common.copy') }}
                    </cv-button>
                </div>

                <div class="vis-configuration-browser__operation">
                    <cv-button type="primary" text @click="exportConfiguration()">
                        {{ t('vis.common.download') }}
                    </cv-button>
                </div>

                <div class="vis-configuration-browser__operation">
                    <cv-button type="primary" text @click="$router.go(-1)">
                        {{ t('vis.common.goBack') }}
                    </cv-button>
                </div>
            </div>
        </div>

        <div class="vis-configuration-browser__main">
            <vis-player :vis-id="visId" @send-configuration="sendConfiguration"></vis-player>
        </div>
    </div>
    <vis-obj-definition-dialog
        ref="defDialog"
        v-model:formModel="formModel"
        :title="t('vis.configuration.copyConfiguration')"
        :is-primitive="false"
        :get-tags="ConfigurationApi.getTags"
        :check-name="ConfigurationApi.checkName"
        :submit="copyConfiguration"
    ></vis-obj-definition-dialog>
</template>
<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {useRoute, useRouter} from 'vue-router';
import {ref} from 'vue';
import type {IConfiguration} from '@cloudview.visualization-next/services';
import {Configuration, ConfigurationApi, Utils, VisRouteNames} from '@cloudview.visualization-next/services';
import VisObjDefinitionDialog from '../../obj-definition-dialog';
import VisPlayer from '../../player';

defineOptions({name: 'VisConfigurationBrowser'});

const {t} = useLocale();
const route = useRoute();
const router = useRouter();
const visId = route.params.id as string;
const defDialog = ref();
const configurationConfig = ref<IConfiguration>();

const sendConfiguration = (config: IConfiguration) => {
    configurationConfig.value = config;
    formModel.value = Utils.deepClone(config);
    formModel.value.name += t('vis.common.ectype');
};

const exportConfiguration = async () => {
    const result = await ConfigurationApi.exportConfiguration([visId]);
    if (result.state) {
        Utils.download(result.data, configurationConfig.value?.name + '.bin');
    } else {
        CvMessage({type: 'error', message: t('vis.common.failedExport')});
    }
};

const jumpToEdit = () => {
    router.push({
        name: VisRouteNames.CONFIGURATION_EDITOR,
        params: {
            id: visId,
        },
    });
};

const formModel = ref<IConfiguration>({} as IConfiguration);
const copyConfiguration = async () => {
    const configuration = new Configuration(formModel.value);
    const res = await ConfigurationApi.addConfiguration(configuration.getConfig());
    if (res.state) {
        CvNotification.success({
            message: t(`vis.configuration.message.copySuccess`),
        });
        return true;
    }
    CvNotification.error({
        title: t(`vis.configuration.message.copyFailed`),
        message: t(`vis.error.${res.data.code}`),
    });
    return false;
};
</script>
