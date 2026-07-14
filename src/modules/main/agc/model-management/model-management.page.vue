<template>
    <div class="container">
        <div class="side-tree__wrapper">
            <collapse-slider v-model="collapse" :width="sliderProps.width" :collapse-width="sliderProps.collapseWidth">
                <cv-button style="margin: 8px auto;width: 100%;" v-if="!treeData?.length"
                           @click="modelManageRef.open()">新增厂站
                </cv-button>
                <cv-tree
                    ref="treeRef"
                    :data="treeData"
                    :props="{
                        label: 'name',
                    }"
                    default-expand-all
                    @node-click="handleNodeClick"
                >
                    <template #default="{ node,data }">
                        <div class="custom-tree-node">
                            <div class="custom-tree-node-cont">{{ node.label }}</div>
                        </div>
                        <cv-popover
                            ref="myPopover"
                            :width="210"
                            placement="right-start"
                            popper-style="padding:0"
                            trigger="click"
                            :hide-after="0"
                        >
                            <template #reference>
                                <div class="custom-tree__icon">
                                    <cv-icon :size="14" color="#3162E1">
                                        <cv-icon-d-more></cv-icon-d-more>
                                    </cv-icon>
                                </div>
                            </template>
                            <div class="config-menu">
                                <div
                                    @click="createNode(node,data)">
                                    新增
                                </div>
                                <div @click="removeNode(node,data)">
                                    删除
                                </div>
                            </div>
                        </cv-popover>
                    </template>
                </cv-tree>
            </collapse-slider>
        </div>
        <div class="main-contain">
            <div class="main-contain__header">
                <span>{{ modelName }}</span>
                <cv-button type="primary" @click="handleSubmit" :disabled="renderCount <= 0">
                    <cv-icon :size="16" color="transparent" style="cursor: pointer">
                        <icon-submit></icon-submit>
                    </cv-icon>
                    <span>提交</span>
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
                        <cv-form-item label="名称" prop="name">
                            <cv-input v-model.trim="formData.name"
                                      placeholder="请输入名称" />
                        </cv-form-item>
                    </cv-form>
                    <div class="header">
                        <span>静态参数</span>
                    </div>
                    <div class="divider"></div>
                    <div class="static-parameter-table">
                        <cv-table :data="formData.para" class="table-container" row-key="id">
                            <cv-table-column prop="name" label="名称" />
                            <cv-table-column prop="desc" label="描述" />
                            <cv-table-column prop="type" label="数据类型" />
                            <cv-table-column prop="max" label="最大值" />
                            <cv-table-column prop="min" label="最小值" />
                            <cv-table-column prop="value" label="值">
                                <template #default="scope">
                                    <cv-input-number 
                                        v-if="scope.row.min && scope.row.max" 
                                        v-model="scope.row.value" 
                                        :min="scope.row.min" 
                                        :max="scope.row.max"
                                        @change="(val) => { scope.row.value = Number(Number(val).toFixed(2)) }"
                                    />
                                    <cv-input v-else v-model.trim="scope.row.value" />
                                </template>
                            </cv-table-column>
                        </cv-table>
                    </div>
                    <div style="padding: 16px;font-weight: bold;">动态参数</div>
                    <div class="divider"></div>
                    <div class="static-parameter-table">
                        <cv-table :data="formData.dyn_para" class="table-container" row-key="id">
                            <cv-table-column prop="name" label="名称" />
                            <cv-table-column prop="desc" label="描述" />
                            <cv-table-column prop="type" label="类别" />
                            <cv-table-column prop="database_id" label="绑定点位ID" />
                            <cv-table-column prop="value" label="操作" width="160">
                                <template #default="scope">
                                    <cv-button text type="primary"
                                               @click="bindRecords = scope.row;pickPointRef.open(false,scope.row.database_id,true)"
                                    >绑定
                                    </cv-button>
                                    <cv-button v-if="scope.row.database_id" text @click="scope.row.database_id = ''">
                                        取消绑定
                                    </cv-button>
                                </template>
                            </cv-table-column>
                        </cv-table>
                    </div>
                </template>
            </div>
        </div>
        <model-management-dialog ref="modelManageRef" @refresh="queryTreeData"></model-management-dialog>
        <pick-point ref="pickPointRef" @submit="({id}) => bindRecords.database_id = id" />
    </div>
</template>
<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import CollapseSlider from '@/common/collapse-slider.vue';
import ModelManagementDialog from './model-management.dialog.vue';
import ModelManagementServiceApi from '@/modules/main/agc/model-management/model-management.service';
import {IconSubmit} from '@/icons';
import Empty from '@/common/empty.vue';
import {CvMessageBox} from 'cloudview.ui-next';
import _ from 'lodash';
import PickPoint from '@/modules/main/capture/point/pick-point.vue';

const sliderProps = {
    collapseWidth: '48px',
    width: '320px',
};
const rules = {
    name: [
        {
            required: true,
            message: '请输入名称',
            trigger: 'blur',
        },
    ],
};
const treeRef = ref();
const modelManageRef = ref();
const pickPointRef = ref();
const collapse = ref(false);
const treeData = ref([]);
const options = ref([]);
const formData = ref<any>({});
const currentNode = ref<any>();
const modelName = ref();
const bindRecords = ref();
const renderCount = ref(-1);

const sliderWidth = computed(() => {
    return collapse.value ? sliderProps.collapseWidth : sliderProps.width;
});
watch(() => formData.value, () => {
    renderCount.value++;
}, {
    deep: true,
});
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
    // 定义需要转换的属性列表
    const propertiesToConvert = ['INLINE', 'TRANSFORMER', 'LOAD', 'CHARGE', 'BMS', 'LIQUIDCOOL', ...options.value];
    // 如果当前项是数组，遍历数组中的每个元素
    if (Array.isArray(obj)) {
        return obj.map(item => convertToChildren(item));
    }
    // 如果当前项是对象，处理对象的每个属性
    else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 如果当前属性是需要转换的属性之一
                if (propertiesToConvert.includes(key as string)) {
                    // 将其转换为children属性
                    newObj['children'] = (newObj['children'] ?? []).concat(convertToChildren(obj[key]));
                } else {
                    // 否则，递归处理该属性
                    newObj[key] = convertToChildren(obj[key]);
                }
            }
        }
        return newObj;
    }
    // 如果是基本类型值，直接返回
    return obj;
};
const createNode = (node: any, data: any) => {
    modelManageRef.value.open(data, node);
};
const removeNode = (_: any, data: any) => {
    CvMessageBox.confirm('是否确定删除？', '提示', {
        type: 'warning',
    }).then(async () => {
        const {name} = data;
        const res = await ModelManagementServiceApi.deleteAgcDevice(name);
        if (res.state) {
            CvMessage.success('操作成功');
            queryTreeData();
            modelName.value = null;
            currentNode.value = null;
            renderCount.value = -1;
            formData.value = {};
        } else CvMessage.error(res.data.msg);
    });
};
const convertValueToString = (items: any[]) => {
    return items.map(item => ({
        ...item,
        value: String(item.value)
    }));
};

const handleNodeClick = (data: any, node: any) => {
    if (node === currentNode.value) return;
    const {name, type, dyn_para, para} = data;
    currentNode.value = node;
    modelName.value = name;
    // 初始化状态
    renderCount.value = -1;
    formData.value = _.cloneDeep({name, type, dyn_para, para});
};

const handleSubmit = async () => {
    const {name, type, dyn_para, para} = formData.value;
    const {data: {name: deviceName}} = currentNode.value;
    // 将 value 字段转换为字符串
    const convertedPara = convertValueToString(para || []);
    const res = await ModelManagementServiceApi.updateAgcDevice(deviceName, {name, type, dyn_para, para: convertedPara});
    if (res.state) {
        modelName.value = name;
        CvMessage.success('操作成功');
        renderCount.value = 0;
        queryTreeData();
    } else CvMessage.error(res.data.msg);
};

</script>
<style scoped lang="scss">
.custom-tree-node {
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-cont {
        width: 148px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.custom-tree__icon {
    visibility: hidden;

    :deep(.el-icon) {
        color: #35353e !important;
    }
}

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

$sliderWidth: v-bind(sliderWidth);
$gap: 24px;
.container {
    width: 100%;
    height: 100%;
    display: flex;
    gap: $gap;
}

.side-tree__wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 12px;
}

.main-contain__header {
    height: 48px;
    background: #fff;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EBEBEB;
}

.main-contain__center {
    background: #fff;
    height: calc(100% - 48px);
    overflow: auto;
}

.main-contain {
    height: 100%;
    display: flex;
    flex-direction: column;
    width: calc(100% - $gap - $sliderWidth);
    border-radius: 8px;
    overflow: hidden;

    .header {
        padding: 16px;
        font-weight: bold;
    }
}

.static-parameter-table {
    padding: 16px;
}

.divider {
    border-bottom: 1px solid #E5E6EA;
}
</style>