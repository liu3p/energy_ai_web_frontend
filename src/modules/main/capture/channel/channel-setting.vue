<template>
    <div class="rtu-container">
        <cv-form ref="ruleFormRef" :rules="rules" label-width="120px" :inline="true" :model="form" style="height: 100%">
            <div class="rtu-contain__header">
                <span>基础信息</span>
                <div>
                    <cv-form-item style="margin: 0 4px">
                        <cv-button size="mini" @click="save">保存</cv-button>
                    </cv-form-item>
                    <cv-form-item style="margin: 0 4px">
                        <cv-button type="primary" size="mini" @click="publicNotify">发布</cv-button>
                    </cv-form-item>
                </div>
            </div>
            <div class="rtu-contain__center">
                <cv-scrollbar height="100%">
                    <div>
                        <cv-form-item label="通道名称" prop="name" required>
                            <cv-input v-model="form.name"></cv-input>
                        </cv-form-item>
                        <cv-form-item label="通道ID">
                            <cv-input v-model="form.id" disabled></cv-input>
                        </cv-form-item>
                    </div>
                    <template v-for="(layer, index) in layerStates" :key="layer.type">
                        <div>
                            <cv-form-item
                                :label="layerLabel(layer.type)"
                                :style="index === 0 ? undefined : {marginTop: '16px'}"
                            >
                                <cv-select
                                    :model-value="layer.selectedId"
                                    filterable
                                    clearable
                                    @change="(id: string | number) => handleLayerChange(layer.type, id)"
                                >
                                    <cv-option
                                        v-for="item in layer.options"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                    />
                                </cv-select>
                            </cv-form-item>
                        </div>
                        <div class="protocol-layer-table">
                            <cv-table :data="layer.selected?.parameters ?? []" style="width: 100%">
                                <cv-table-column type="index" label="序号" width="80" />
                                <cv-table-column prop="name" label="参数" />
                                <cv-table-column label="数据类型" />
                                <cv-table-column prop="value" label="值">
                                    <template #default="{row}">
                                        <cv-input v-if="!row.valuelist" size="default" v-model="row.value"></cv-input>
                                        <cv-select v-else size="default" v-model="row.value">
                                            <cv-option
                                                v-for="item in row.valuelist.split(' ')"
                                                :key="item"
                                                :label="item"
                                                :value="item"
                                            />
                                        </cv-select>
                                    </template>
                                </cv-table-column>
                                <cv-table-column label="取值范围" />
                                <cv-table-column label="备注" />
                            </cv-table>
                        </div>
                    </template>
                </cv-scrollbar>
            </div>
        </cv-form>
    </div>
</template>
<script setup lang="ts">
import {ref, reactive, watch, onMounted} from 'vue';
import _ from 'lodash';
import {useLocale} from 'cloudview.ui-next';
import {getPlugins, notifyReload} from '@/modules/main/capture/channel/channel.service';
import {
    buildLayerStates,
    buildPluginsPayload,
    getProtocolLayerLabelKey,
    normalizePluginLayers,
    selectLayerPlugin,
    type LayerState,
    type ProtocolLayer,
} from '@/modules/main/capture/channel/protocol-layers';

const {t} = useLocale();

const emit = defineEmits(['submit']);
const props = defineProps<{
    data: {name: string; id: string};
}>();

const ruleFormRef = ref();
const rules = reactive({
    name: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ],
});
const form = ref<any>({
    name: '',
    id: '',
});

const catalogLayers = ref<ProtocolLayer[]>([]);
const layerStates = ref<LayerState[]>([]);
const pendingSavedPlugins = ref<any[] | null>(null);

const layerLabel = (type: string) =>
    t(`fw.capturePoint.${getProtocolLayerLabelKey(type)}`).replace('{n}', type);

const applyLayerStates = (savedPlugins: any[] = []) => {
    layerStates.value = buildLayerStates(catalogLayers.value, savedPlugins);
};

const handleLayerChange = (type: string, id: string | number | '') => {
    layerStates.value = layerStates.value.map(layer =>
        layer.type === type ? selectLayerPlugin(layer, id) : layer
    );
};

const publicNotify = () => {
    notifyReload().then(res => {
        if (res.state) {
            CvMessage.success('操作成功');
        } else CvMessage.error(res.data.msg);
    });
};

onMounted(() => {
    getPlugins().then(res => {
        if (res.state) {
            catalogLayers.value = normalizePluginLayers(res.data);
            applyLayerStates(pendingSavedPlugins.value ?? (form.value as any)?.plugins ?? []);
            pendingSavedPlugins.value = null;
        }
    });
});

const save = () => {
    ruleFormRef.value.validate((valid: any) => {
        if (valid) {
            // POST|PUT /fecfg/cgroup/:cgid/channel[/:cid] 改动后：
            // { name, possibleownerid, plugins: [{id, parameters}] }，不再传 appplugin/linkplugin
            const possibleownerid = form.value?.possibleowner?.id ?? form.value?.possibleownerid;
            emit('submit', {
                name: form.value.name,
                possibleownerid,
                plugins: buildPluginsPayload(layerStates.value),
            });
        }
    });
};

const resolveSavedPlugins = (values: any) => {
    if (Array.isArray(values?.plugins)) return values.plugins;
    // 兼容旧读法：顶层 appplugin / linkplugin
    return [values?.linkplugin, values?.appplugin].filter(Boolean);
};

watch(
    () => props.data,
    (values: any) => {
        const plugins = resolveSavedPlugins(values);
        form.value = _.cloneDeep(values);
        if (catalogLayers.value.length) {
            applyLayerStates(plugins);
        } else {
            pendingSavedPlugins.value = plugins;
        }
    },
    {immediate: true}
);
</script>
<style scoped lang="scss">
.rtu-container {
    width: 100%;
    height: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
}

.rtu-contain__header {
    height: 48px;
    background: #fff;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ebebeb;
}

.rtu-contain__center {
    padding: 16px;
    background: #fff;
    height: calc(100% - 48px);
    overflow: hidden;
}

.bold-text {
    color: #35353e;
    font-weight: bold;
}

.protocol-layer-table {
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: scroll;
}
</style>
