<template>
    <div class="container">
        <div class="panel">
            <div class="side-tree">
                <cv-button
                    v-if="!treeData?.length"
                    style="margin-bottom: 8px; width: 100%"
                    @click="modelManageRef.open()"
                >
                    {{ t('fw.modelManagement.addStation') }}
                </cv-button>
                <cv-scrollbar :height="treeData?.length ? '100%' : 'calc(100% - 40px)'">
                    <cv-tree
                        ref="treeRef"
                        class="device-tree"
                        node-key="name"
                        :data="treeData"
                        :props="{
                            label: 'name',
                            children: 'children',
                        }"
                        :current-node-key="currentKey"
                        :indent="18"
                        highlight-current
                        default-expand-all
                        @node-click="handleNodeClick"
                    >
                        <template #default="{node, data}">
                            <div class="custom-tree-node">
                                <div class="custom-tree-node-cont">{{ node.label }}</div>
                                <cv-popover
                                    :width="210"
                                    placement="right-start"
                                    popper-style="padding:0"
                                    trigger="click"
                                    :hide-after="0"
                                >
                                    <template #reference>
                                        <div class="custom-tree__icon" @click.stop>
                                            <cv-icon :size="14" color="#98a3be">
                                                <cv-icon-d-more></cv-icon-d-more>
                                            </cv-icon>
                                        </div>
                                    </template>
                                    <div class="config-menu">
                                        <div @click="createNode(node, data)">{{ t('fw.common.add') }}</div>
                                        <div @click="removeNode(node, data)">{{ t('fw.common.delete') }}</div>
                                    </div>
                                </cv-popover>
                            </div>
                        </template>
                    </cv-tree>
                </cv-scrollbar>
            </div>
            <div class="main-contain">
                <div class="main-contain__header">
                    <span>{{ modelName }}</span>
                    <cv-button type="primary" :disabled="renderCount <= 0" @click="handleSubmit">
                        <cv-icon :size="16" color="transparent" style="cursor: pointer">
                            <icon-submit></icon-submit>
                        </cv-icon>
                        <span>{{ t('fw.common.submit') }}</span>
                    </cv-button>
                </div>
                <div class="main-contain__center">
                    <Empty v-if="!modelName" />
                    <template v-else>
                        <cv-form
                            ref="formRef"
                            :inline="true"
                            :model="formData"
                            :rules="rules"
                            style="padding: 16px 16px 0 16px"
                        >
                            <cv-form-item :label="t('fw.modelManagement.name')" prop="name">
                                <cv-input
                                    v-model.trim="formData.name"
                                    :placeholder="t('fw.modelManagement.pleaseInputName')"
                                />
                            </cv-form-item>
                        </cv-form>
                        <div class="header">
                            <span>{{ t('fw.modelManagement.staticParams') }}</span>
                        </div>
                        <div class="divider"></div>
                        <div class="static-parameter-table">
                            <cv-table :data="formData.para" class="table-container" row-key="id">
                                <cv-table-column prop="name" :label="t('fw.modelManagement.name')" />
                                <cv-table-column prop="desc" :label="t('fw.modelManagement.description')" />
                                <cv-table-column prop="type" :label="t('fw.modelManagement.dataType')" />
                                <cv-table-column prop="max" :label="t('fw.modelManagement.max')" />
                                <cv-table-column prop="min" :label="t('fw.modelManagement.min')" />
                                <cv-table-column prop="value" :label="t('fw.modelManagement.value')">
                                    <template #default="scope">
                                        <cv-input-number
                                            v-if="scope.row.min && scope.row.max"
                                            v-model="scope.row.value"
                                            :min="scope.row.min"
                                            :max="scope.row.max"
                                            @change="
                                                val => {
                                                    scope.row.value = Number(Number(val).toFixed(2));
                                                }
                                            "
                                        />
                                        <cv-input v-else v-model.trim="scope.row.value" />
                                    </template>
                                </cv-table-column>
                            </cv-table>
                        </div>
                        <div style="padding: 16px; font-weight: bold">
                            {{ t('fw.modelManagement.dynamicParams') }}
                        </div>
                        <div class="divider"></div>
                        <div class="static-parameter-table">
                            <cv-table :data="formData.dyn_para" class="table-container" row-key="id">
                                <cv-table-column prop="name" :label="t('fw.modelManagement.name')" />
                                <cv-table-column prop="desc" :label="t('fw.modelManagement.description')" />
                                <cv-table-column prop="type" :label="t('fw.modelManagement.category')" />
                                <cv-table-column prop="database_id" :label="t('fw.modelManagement.bindPointId')" />
                                <cv-table-column
                                    prop="value"
                                    :label="t('fw.common.operation')"
                                    width="180"
                                    min-width="180"
                                    align="center"
                                >
                                    <template #default="scope">
                                        <div class="table-actions">
                                            <cv-button
                                                text
                                                type="primary"
                                                @click="
                                                    bindRecords = scope.row;
                                                    pickPointRef.open(false, scope.row.database_id, true);
                                                "
                                            >
                                                {{ t('fw.modelManagement.bind') }}
                                            </cv-button>
                                            <cv-button
                                                v-if="scope.row.database_id"
                                                text
                                                @click="scope.row.database_id = ''"
                                            >
                                                {{ t('fw.modelManagement.unbind') }}
                                            </cv-button>
                                        </div>
                                    </template>
                                </cv-table-column>
                            </cv-table>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <model-management-dialog ref="modelManageRef" @refresh="queryTreeData"></model-management-dialog>
        <pick-point ref="pickPointRef" @submit="({id}) => (bindRecords.database_id = id)" />
    </div>
</template>
<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {CvMessageBox, useLocale} from 'cloudview.ui-next';
import ModelManagementDialog from './model-management.dialog.vue';
import ModelManagementServiceApi from '@/modules/main/agc/model-management/model-management.service';
import {IconSubmit} from '@/icons';
import Empty from '@/common/empty.vue';
import _ from 'lodash';
import PickPoint from '@/modules/main/capture/point/pick-point.vue';

const {t} = useLocale();

const rules = {
    name: [
        {
            required: true,
            message: t('fw.modelManagement.pleaseInputName'),
            trigger: 'blur',
        },
    ],
};
const treeRef = ref();
const modelManageRef = ref();
const pickPointRef = ref();
const treeData = ref([]);
const options = ref([]);
const formData = ref<any>({});
const currentNode = ref<any>();
const currentKey = ref('');
const modelName = ref();
const bindRecords = ref();
const renderCount = ref(-1);

watch(
    () => formData.value,
    () => {
        renderCount.value++;
    },
    {
        deep: true,
    },
);

const queryTreeData = () => {
    ModelManagementServiceApi.queryAgcStation().then(res => {
        if (res.state) {
            if (Object.keys(res.data).length) {
                treeData.value = [].concat(convertToChildren(res.data));
            } else {
                treeData.value = [];
            }
        }
    });
};

onMounted(() => {
    ModelManagementServiceApi.queryDeviceTypes().then(res => {
        if (res.state) {
            options.value = res.data || [];
            queryTreeData();
        }
    });
});

// 转换函数
const convertToChildren = (obj: any): any => {
    const propertiesToConvert = ['INLINE', 'TRANSFORMER', 'LOAD', 'CHARGE', 'BMS', 'LIQUIDCOOL', ...options.value];
    if (Array.isArray(obj)) {
        return obj.map(item => convertToChildren(item));
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (propertiesToConvert.includes(key as string)) {
                    newObj['children'] = (newObj['children'] ?? []).concat(convertToChildren(obj[key]));
                } else {
                    newObj[key] = convertToChildren(obj[key]);
                }
            }
        }
        return newObj;
    }
    return obj;
};

const createNode = (node: any, data: any) => {
    modelManageRef.value.open(data, node);
};

const removeNode = (_: any, data: any) => {
    CvMessageBox.confirm(t('fw.common.confirmDel'), t('fw.common.tips'), {
        type: 'warning',
    }).then(async () => {
        const {name} = data;
        const res = await ModelManagementServiceApi.deleteAgcDevice(name);
        if (res.state) {
            CvMessage.success(t('fw.common.operateSuccess'));
            queryTreeData();
            modelName.value = null;
            currentNode.value = null;
            currentKey.value = '';
            renderCount.value = -1;
            formData.value = {};
        } else CvMessage.error(res.data.msg);
    });
};

const convertValueToString = (items: any[]) => {
    return items.map(item => ({
        ...item,
        value: String(item.value),
    }));
};

const handleNodeClick = (data: any, node: any) => {
    if (node === currentNode.value) return;
    const {name, type, dyn_para, para} = data;
    currentNode.value = node;
    currentKey.value = name;
    modelName.value = name;
    renderCount.value = -1;
    formData.value = _.cloneDeep({name, type, dyn_para, para});
};

const handleSubmit = async () => {
    const {name, type, dyn_para, para} = formData.value;
    const {
        data: {name: deviceName},
    } = currentNode.value;
    const convertedPara = convertValueToString(para || []);
    const res = await ModelManagementServiceApi.updateAgcDevice(deviceName, {
        name,
        type,
        dyn_para,
        para: convertedPara,
    });
    if (res.state) {
        modelName.value = name;
        currentKey.value = name;
        CvMessage.success(t('fw.common.operateSuccess'));
        renderCount.value = 0;
        queryTreeData();
    } else CvMessage.error(res.data.msg);
};
</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
}

.panel {
    display: flex;
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
}

.side-tree {
    flex: 0 0 240px;
    width: 240px;
    height: 100%;
    padding: 16px 12px;
    border-right: 1px solid #eef1f6;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.device-tree {
    background: transparent;

    :deep(.el-tree-node__content) {
        height: 36px;
        margin-bottom: 2px;
        padding-right: 8px;
        border-radius: 6px;
        color: #35353e;
        font-size: 14px;
        font-weight: 400;
    }

    :deep(.el-tree-node__content:hover) {
        background-color: #f5f6f8;
    }

    :deep(.el-tree-node__expand-icon) {
        margin-right: 4px;
        font-size: 12px;
        color: #98a3be;
    }

    :deep(.el-tree-node__expand-icon.is-leaf) {
        color: transparent;
        cursor: default;
    }

    :deep(.is-current > .el-tree-node__content) {
        background-color: #f0f1f5 !important;
        color: #35353e !important;
        font-weight: 400 !important;
    }
}

.custom-tree-node {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-cont {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.custom-tree__icon {
    flex-shrink: 0;
    visibility: hidden;
    margin-left: 4px;

    :deep(.el-icon) {
        color: #98a3be !important;
    }
}

:deep(.el-tree-node__content:hover .custom-tree__icon),
:deep(.is-current > .el-tree-node__content .custom-tree__icon) {
    visibility: visible !important;
}

.config-menu {
    > div {
        width: 100%;
        padding: 0 16px;
        height: 40px;
        line-height: 40px;
        cursor: pointer;
    }

    > div:hover {
        background: rgba(63, 63, 74, 0.1);
        color: #35353e;
    }
}

.main-contain {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
        padding: 16px;
        font-weight: bold;
    }
}

.main-contain__header {
    height: 48px;
    background: transparent;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ebebeb;
}

.main-contain__center {
    background: transparent;
    height: calc(100% - 48px);
    overflow: auto;
}

.static-parameter-table {
    padding: 16px;
}

.table-actions {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    white-space: nowrap;
    gap: 0;
}

.divider {
    border-bottom: 1px solid #e5e6ea;
}
</style>
