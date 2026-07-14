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
                    <div>
                        <cv-form-item label="应用层协议">
                            <cv-select v-model="form.appPluginId" filterable @change="handleAppChange" clearable>
                                <cv-option
                                    v-for="item in appPluginOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </cv-select>
                        </cv-form-item>
                    </div>
                    <div>
                        <cv-table :data="appPluginTable?.parameters ?? []" style="width: 100%">
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
                    <div>
                        <cv-form-item label="链路层协议" style="margin-top: 16px">
                            <cv-select v-model="form.linkPluginId" filterable @change="handleLinkChange" clearable>
                                <cv-option
                                    v-for="item in linkPluginOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                />
                            </cv-select>
                        </cv-form-item>
                    </div>
                    <div>
                        <cv-table :data="linkPluginTable?.parameters ?? []" style="width: 100%">
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
                </cv-scrollbar>
            </div>
        </cv-form>
    </div>
</template>
<script setup lang="ts">
import {ref, reactive, watch, onMounted, computed} from 'vue';
import _ from 'lodash';
import {getPlugins, notifyReload} from '@/modules/main/capture/channel/channel.service';

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
    appPluginId: '',
    linkPluginId: '',
});
const appPluginOptions = ref();
const linkPluginOptions = ref();
const appPluginTable = ref();
const linkPluginTable = ref();
const handleAppChange = (id: string) => {
    appPluginTable.value = appPluginOptions.value?.find((item: any) => item.id === id);
};
const formatAppValueList = () => {
    const sourceAppPlugin = appPluginOptions.value?.find((opt: any) => opt.id === appPluginTable.value.id);
    if (sourceAppPlugin?.parameters && appPluginTable.value?.parameters) {
        const paramMap = new Map(sourceAppPlugin.parameters.map((p: any) => [p.name, p.valuelist]));
        appPluginTable.value.parameters.forEach((param: any) => {
            param.valuelist = paramMap.get(param.name);
        });
    }
};

const handleLinkChange = (id: string) => {
    linkPluginTable.value = linkPluginOptions.value?.find((item: any) => item.id === id);
};
const formatLinkValueList = () => {
    const sourceLinkPlugin = linkPluginOptions.value?.find((opt: any) => opt.id === linkPluginTable.value.id);
    if (sourceLinkPlugin?.parameters && linkPluginTable.value?.parameters) {
        const paramMap = new Map(sourceLinkPlugin.parameters.map((p: any) => [p.name, p.valuelist]));
        linkPluginTable.value.parameters.forEach((param: any) => {
            param.valuelist = paramMap.get(param.name);
        });
    }
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
            const {appplugin, linkplugin} = res.data;
            appPluginOptions.value = appplugin;
            formatAppValueList();
            linkPluginOptions.value = linkplugin;
            formatLinkValueList();
        }
    });
});

const save = () => {
    ruleFormRef.value.validate((valid: any) => {
        if (valid) {
            const {
                comment,
                id,
                name,
                onduty,
                servergroup,
                possibleowner: {id: possibleownerid},
            } = form.value;
            const appplugin =
                appPluginTable.value?.id || appPluginTable.value?.id === 0
                    ? {
                          id: appPluginTable.value.id,
                          name: appPluginTable.value.name,
                          type: 'APP',
                          parameters: appPluginTable.value.parameters,
                      }
                    : null;
            const linkplugin =
                linkPluginTable.value?.id || linkPluginTable.value?.id === 0
                    ? {
                          id: linkPluginTable.value.id,
                          name: linkPluginTable.value.name,
                          type: 'LINK',
                          parameters: linkPluginTable.value.parameters,
                      }
                    : null;
            emit('submit', {
                comment,
                id,
                name,
                onduty,
                servergroup,
                possibleownerid,
                appplugin,
                linkplugin,
            });
        }
    });
};

watch(
    () => props.data,
    (values: any) => {
        const plugins = values.plugins ?? [];
        form.value = _.cloneDeep(values);
        appPluginTable.value = {};
        linkPluginTable.value = {};
        plugins.forEach((item: any) => {
            if (item.type === 'APP') {
                form.value.appPluginId = item.id;
                appPluginTable.value = item;
                formatAppValueList();
            } else if (item.type === 'LINK') {
                form.value.linkPluginId = item.id;
                linkPluginTable.value = item;
                formatLinkValueList();
            } else {
                appPluginTable.value = item;
                linkPluginTable.value = {};
            }
        });
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
</style>
