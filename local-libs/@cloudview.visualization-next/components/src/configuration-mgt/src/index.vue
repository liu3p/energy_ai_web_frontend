<template>
    <vis-mgt-framework
        ref="framework"
        v-model:query="query"
        v-model:keywords="keywords"
        class="vis-configuration-mgt"
        :title="t('vis.configuration.configuration')"
        :get-tags="getTags"
        :total="total"
        :loading="loading"
        @create="createConfiguration"
        @batch-download="beforeBatchDownload"
        @batch-import="beforeBatchImport"
    >
        <vis-card
            v-for="item in configurationList"
            :key="item.id"
            :info="item"
            :operates="operates"
            :img-src="thumbMap[item.thumb_id]"
            @delete="deleteConfiguration"
            @click-img="gotoConfigurationBrowser"
        >
        </vis-card>
        <div v-if="configurationList.length === 0 && !loading">{{ t('vis.common.noConfiguration') }}</div>
    </vis-mgt-framework>
    <vis-obj-definition-dialog
        ref="defDialog"
        v-model:formModel="formModel"
        :title="title"
        :is-primitive="false"
        :get-tags="getTags"
        :submit="definitionSubmit"
        :check-name="ConfigurationApi.checkName"
    ></vis-obj-definition-dialog>
    <vis-import-export-dialog
        v-if="transmitDialogVisible"
        ref="transmitDialog"
        :type="transmitDialogType"
        :is-primitive="false"
        :get-tags-method="ConfigurationApi.getTags"
        :get-list-method="ConfigurationApi.getConfigurationList"
        :export-method="ConfigurationApi.exportConfiguration"
        :import-preview-method="ConfigurationApi.importPreviewConfigurations"
        :import-method="ConfigurationApi.importConfigurations"
        @cancel="transmitCancel"
        @refresh="getConfigurationList"
    ></vis-import-export-dialog>
</template>
<script lang="ts" setup>
import type {IMgtFrameworkQuery} from '../../mgt-framework';
import VisMgtFramework from '../../mgt-framework';
import VisCard from '../../card';
import VisObjDefinitionDialog from '../../obj-definition-dialog';
import VisImportExportDialog, {ImportExportDialogTypeEnum} from '../../import-export-dialog';
import {useLocale} from 'cloudview.ui-next';
import {reactive, ref, watch} from 'vue';
import type {IConfiguration, IErrorData, IObject, IPaginationData} from '@cloudview.visualization-next/services';
import {
    Configuration,
    ConfigurationApi,
    EngineTypeEnum,
    ObjectApi,
    StringUtils,
    useGlobalConfig,
    Utils,
    VisRouteNames,
} from '@cloudview.visualization-next/services';
import {useRouter} from 'vue-router';

defineOptions({name: 'ConfigurationMgt'});
const {t} = useLocale();
const router = useRouter();

const framework = ref();
const {getTags} = ConfigurationApi;
const total = ref(0);
const configurationList = reactive<IConfiguration[]>([]);
const query = ref<IMgtFrameworkQuery>({
    tag: '',
    engineType: EngineTypeEnum.ALL,
    page: 1,
    pageSize: 20,
});
const keywords = ref('');

const loading = ref(false);
const defDialog = ref();
const title = ref('');
const vnbId = useGlobalConfig('vnbId');
const formModel = ref();
const thumbMap = ref<Record<string, string>>({});

const formatQuery = () => {
    const queryInfo = {};
    for (const key in query.value) {
        if (!Utils.isString(query.value[key]) || !StringUtils.isEmpty(query.value[key])) {
            queryInfo[key] = query.value[key];
        }
    }
    if (!StringUtils.isEmpty(keywords.value)) {
        queryInfo['keywords'] = keywords.value;
    }
    return queryInfo;
};

const getThumbList = async thumbSet => {
    const ids = Array.from(thumbSet);
    const res = await ObjectApi.getAssets(ids);
    if (res.state) {
        thumbMap.value = {};
        res.data = res.data as IObject[];
        res.data.forEach(item => {
            thumbMap.value[item.id] = item.content;
        });
    }
};

const getConfigurationList = async () => {
    loading.value = true;
    try {
        const res = await ConfigurationApi.getConfigurationList(formatQuery());
        if (res.state) {
            configurationList.length = 0;
            res.data = res.data as IPaginationData<IConfiguration[]>;
            const thumbSet = new Set<string>();
            res.data.data.forEach(item => {
                configurationList.push(item);
                if (!StringUtils.isEmpty(item.thumb_id)) {
                    thumbSet.add(item.thumb_id!);
                }
            });
            total.value = res.data.pagination.total_count;
            await getThumbList(thumbSet);
        }
    } finally {
        loading.value = false;
    }
};

watch(
    () => query.value,
    () => {
        getConfigurationList();
    },
    {
        deep: true,
        immediate: true,
    }
);

let latency: number;

watch(keywords, val => {
    window.clearTimeout(latency);
    latency = window.setTimeout(() => {
        getConfigurationList();
    }, 500);
});

watch(
    () => vnbId,
    () => {
        getConfigurationList();
        framework.value.refreshTags();
    },
    {deep: true}
);

const getDefaultFormModel = (): IConfiguration => {
    return {
        name: '',
        tag: '',
        description: '',
        enabled: true,
        engine_type: EngineTypeEnum['2D'],
        thumb_id: '',
        vnb_id: vnbId.value!,
        public: false,
    };
};

formModel.value = getDefaultFormModel();

const definitionAdd = async (notifySuccess: string, notifyFailed: string): Promise<boolean> => {
    const configuration = new Configuration(formModel.value);
    const res = await ConfigurationApi.addConfiguration(configuration.getConfig());
    if (res.state) {
        CvNotification.success({
            message: t(`vis.configuration.message.${notifySuccess}`),
        });
        getConfigurationList();
        return true;
    }
    CvNotification.error({
        title: t(`vis.configuration.message.${notifyFailed}`),
        message: t(`vis.error.${res.data.code}`),
    });
    return false;
};

const definitionCreate = (): Promise<boolean> => {
    return definitionAdd('createSuccess', 'createFailed');
};

const definitionCopy = (): Promise<boolean> => {
    return definitionAdd('copySuccess', 'copyFailed');
};

const definitionSubmit = ref(definitionCreate);

const gotoConfigurationBrowser = (model: IConfiguration) => {
    router.push({
        name: VisRouteNames.CONFIGURATION_BROWSER,
        params: {
            id: model.id,
        },
    });
};
const operates = [
    {
        label: t('vis.common.browse'),
        callback: gotoConfigurationBrowser,
    },
    {
        label: t('vis.common.edit'),
        callback: (model: IConfiguration) => {
            router.push({
                name: VisRouteNames.CONFIGURATION_EDITOR,
                params: {
                    id: model.id,
                },
            });
        },
    },
    {
        label: t('vis.common.copy'),
        callback: async (model: IConfiguration) => {
            const res = await ConfigurationApi.getConfigurationById(model.id!);
            if (res.state) {
                defDialog.value.open();
                title.value = t('vis.configuration.copyConfiguration');
                formModel.value = JSON.parse(JSON.stringify(res.data));
                formModel.value.id = '';
                formModel.value.name += t('vis.common.ectype');
                definitionSubmit.value = definitionCopy;
            } else {
                res.data = res.data as IErrorData;
                CvNotification.error({
                    title: t('vis.configuration.getConfigurationFailed'),
                    message: t(`vis.error.${res.data.code}`),
                });
            }
        },
    },
    {
        label: t('vis.common.download'),
        callback: async (model: IConfiguration) => {
            const result = await ConfigurationApi.exportConfiguration([model.id!]);
            if (result.state) {
                Utils.download(result.data, model.name + '.bin');
            } else {
                CvMessage({type: 'error', message: t('vis.common.failedExport')});
            }
        },
    },
];

const deleteConfiguration = async (info: IConfiguration) => {
    try {
        await CvMessageBox.confirm(t('vis.configuration.deleteConfiguration', {0: info.name}), t('vis.common.prompt'), {
            type: 'info',
        });
        const res = await ConfigurationApi.deleteConfiguration(info.id!);
        if (res.state) {
            CvNotification.success({
                message: t('vis.message.deleteSuccess'),
            });
            await getConfigurationList();
            framework.value.refreshTags();
        } else {
            CvNotification.error({
                title: t('vis.message.deleteFailed'),
                message: t(`vis.error.${res.data.code}`),
            });
        }
    } catch (e) {
        console.log(e);
    }
};

const createConfiguration = () => {
    defDialog.value.open();
    title.value = t('vis.configuration.createConfiguration');
    formModel.value = getDefaultFormModel();
    definitionSubmit.value = definitionCreate;
};

const transmitDialogVisible = ref(false);
const transmitDialogType = ref(ImportExportDialogTypeEnum.export);

const beforeBatchDownload = async () => {
    transmitDialogType.value = ImportExportDialogTypeEnum.export;
    transmitDialogVisible.value = true;
};

const beforeBatchImport = async () => {
    transmitDialogType.value = ImportExportDialogTypeEnum.import;
    transmitDialogVisible.value = true;
};

const transmitCancel = () => (transmitDialogVisible.value = false);
</script>
