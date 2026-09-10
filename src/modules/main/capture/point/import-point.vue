<template>
  <div class="main-contain">
    <div class="main-contain__header">
      <cv-tabs v-model="activeName" :panes="panes" class="point-type-tabs"></cv-tabs>
    </div>
    <div class="main-contain__center">
      <cv-scrollbar style="height: 40px">
        <cv-form ref="formRef" inline :model="formData" class="form-container">
          <cv-form-item :label="t('fw.capturePoint.gin')">
            <cv-input v-model.trim="formData.gin" class="w-cm"/>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.originalName')">
            <cv-input v-model.trim="formData.name" class="w-cm"/>
          </cv-form-item>
          <cv-button size="default" type="primary" @click="handleSearch">
            <span>{{ t('fw.common.search') }}</span>
          </cv-button>
          <cv-button size="default" @click="handleReset" style="margin-left: 20px">
            <span>{{ t('fw.common.clear') }}</span>
          </cv-button>
          <div class="extra">
            <cv-button class="primary-btn add-btn" size="mini" v-if="isTransferRtu(rid) || isAgcRtu(rid)" @click="handleAdd">
              <svg class="add-btn__icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2V10M2 6H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ t('fw.capturePoint.add') }}</span>
            </cv-button>
            <cv-button class="primary-btn" size="mini" v-else @click="fileImportRef.open()">
              <cv-icon :size="16" color="transparent">
                <icon-ic-import/>
              </cv-icon>
              <span>{{ t('fw.common.import') }}</span>
            </cv-button>
            <cv-button class="primary-btn" size="mini" @click="handleExport">
              <cv-icon :size="16" color="transparent">
                <icon-ic-export/>
              </cv-icon>
              <span>{{ t('fw.capturePoint.export') }}</span>
            </cv-button>
            <cv-button size="mini" type="danger" :disabled="selectedCount === 0" @click="handleBatchDelete">
              <cv-icon size="16">
                <cv-icon-delete/>
              </cv-icon>
              <span>{{ t('fw.capturePoint.batchDeleteWithCount').replace('{count}', String(selectedCount)) }}</span>
            </cv-button>
            <cv-button
                :loading="loading"
                :disabled="renderCount <= 0 || loading"
                type="primary"
                @click="handleSubmit"
                size="mini"
            >
              <cv-icon :size="16" color="transparent" style="cursor: pointer">
                <icon-submit></icon-submit>
              </cv-icon>
              <span>{{ t('fw.common.submit') }}</span>
            </cv-button>
          </div>

        </cv-form>

      </cv-scrollbar>
      <div class="divider"></div>
      <div class="table-container">
        <collect
            ref="collectRef"
            :active="activeName"
            :points="pointsData"
            :rid="rid"
            :did="did"
            @update-points="initDevicePoints"
            @selection-change="handleSelectionChange"
        />
      </div>
    </div>
    <file-import ref="fileImportRef" @submit="handleImportPoints"/>
    <reply-point-transfer
        ref="transferRef"
        :type="activeName"
        :deviceOption="deviceOption"
        @submit="handleTransferSubmit"
    />
  </div>
</template>
<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue';
import FileImport from '@/modules/main/capture/point/file-import.vue';
import {IconSubmit, IconIcExport, IconIcImport} from '@/icons';
import Collect from '@/modules/main/capture/point/collect/collect.page.vue';
import ReplyPointTransfer from '@/modules/main/capture/point/transfer/reply-point-transfer.vue';
import {
  delDevicePoints,
  queryDevicePoints,
  updateDevicePoints,
  exportDevicePoints,
  updatePoint,
  importExcelPoints,
} from '@/modules/main/capture/point/point.service';
import {pointType, isAgcRtu, isTransferRtu, isCalcRtu} from '@/modules/main/capture/point/point.model';
import axios from 'axios';
import _ from 'lodash';
import {CvMessageBox, CvMessage, useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

const props = defineProps<{
  node: any;
  deviceOption: any;
}>();

//RTU 父节点 id（类型按 id 区间判定，不用 data.type）
const rid = computed(() => props.node.parent?.data?.id);
const did = computed(() => props.node.data?.id);
const activeName = ref('analog');
const fileImportRef = ref();
const transferRef = ref();
const collectRef = ref();
const selectedCount = ref(0);
const formData = ref<{
  name?: string;
  gin?: string;
}>({});
const pointsData = ref<any>({});
const initPointsData = ref<any>({});
const rowPointsData = ref<any>({});
const renderCount = ref(-1);
const loading = ref(false);
const panes = computed(() =>
  pointType
    // .filter(item => item.name !== 'attribute')
    .map(item => ({
      ...item,
      label: t(`fw.monitor.pointType.${item.name}`),
    }))
);

const initDevicePoints = (init = true) => {
  const rid = props.node.parent.data.id;
  const did = props.node.data.id;
  const type = activeName.value;
  return queryDevicePoints(rid, did, type).then(res => {
    if (res.state) {
      rowPointsData.value = res.data || {};
      pointsData.value = {...rowPointsData.value};
      initPointsData.value = _.cloneDeep(pointsData.value);
      init && (renderCount.value = -1);
      selectedCount.value = 0;
      collectRef.value?.clearSelection();
    }
    return res;
  });
};

/** 计算量 RTU(900)：检查导入后测点计算点是否均为 1 */
const hasInvalidCalculatedPoint = async (rtuId: string | number, deviceId: string | number) => {
  const types = ['analog', 'digital', 'pulse'] as const;
  const results = await Promise.all(types.map(type => queryDevicePoints(String(rtuId), String(deviceId), type)));
  return results.some(res => {
    if (!res.state) return false;
    return types.some(type => {
      const list = res.data?.[type] ?? [];
      return list.some((point: any) => String(point?.calculated) !== '1');
    });
  });
};

watch(
    () => props.node,
    node => {
      initDevicePoints();
    },
    {immediate: true, deep: true}
);
watch(
    () => rowPointsData.value,
    v => {
      renderCount.value++;
    },
    {
      deep: true,
    }
);
watch(activeName, () => {
  initDevicePoints();
});

const handleImportPoints = async (file: File) => {
  const rid = props.node.parent.data.id;
  const did = props.node.data.id;
  const res = await importExcelPoints(rid, did, file);
  if (res.state) {
    await initDevicePoints(false);
    // 计算量 RTU(id=900)：计算点必须为 1；不满足时提示，但点表仍继续导入
    if (isCalcRtu(rid) || String(rid) === '900') {
      const invalid = await hasInvalidCalculatedPoint(rid, did);
      if (invalid) {
        CvMessage.warning(t('fw.capturePoint.calculatedMustBeOne'));
      } else {
        CvMessage.success(t('fw.capturePoint.importSuccess'));
      }
    } else {
      CvMessage.success(t('fw.capturePoint.importSuccess'));
    }
    renderCount.value = 1;
  } else {
    CvMessage.error(res.data.msg || t('fw.capturePoint.importFailed'));
  }
};

const handleAdd = () => {
  transferRef.value.open({
    type: activeName.value,
    ...props.node.data,
  });
};

const handleSearch = () => {
  const keys: Partial<{
    label: string | number;
    name: string | number;
  }> = {};
  for (const key in formData.value) {
    // @ts-ignore
    if (formData.value[key]) keys[key] = formData.value[key];
  }
  const filterList = rowPointsData.value[activeName.value].filter(item => {
    return Object.values(keys).every((key, index) => {
      return (item[Object.keys(keys)[index]] + '').includes(key);
    });
  });
  pointsData.value[activeName.value] = filterList;
};

const handleSubmit = async () => {
  const rid = props.node.parent.data.id;
  const did = props.node.data.id;

  // 只比较当前激活 tab 的修改项
  const initList = initPointsData.value[activeName.value] || [];
  const currentList = pointsData.value[activeName.value] || [];

  const modifiedItems = currentList.filter((item: any) => {
    const initItem = initList.find((i: any) => i.id === item.id);
    return initItem && JSON.stringify(initItem) !== JSON.stringify(item);
  });

  if (modifiedItems.length > 0) {
    loading.value = true;

    const param = {};
    param[activeName.value] = modifiedItems;
    const res = await updatePoint(rid, did, param);
    if (res.state) {
      CvMessage.success(t('fw.common.operateSuccess'));
      initDevicePoints();
    } else {
      CvMessage.error(res.data.msg || t('fw.common.operateFailed'));
    }
    loading.value = false;
  }
};

const handleTransferSubmit = async (values: any) => {
  const param = {
    analog: [],
    attribute: [],
    control: [],
    digital: [],
    pulse: [],
    regulate: [],
  };
  param[activeName.value] =
      values.map(item => {
        return {
          ...item,
          datasource: item.id,
          id: '',
          gin: '',
        };
      }) || [];
  const rid = props.node.parent.data.id;
  const did = props.node.data.id;
  const res = await updateDevicePoints(rid, did, param);
  if (res.state) {
    initDevicePoints();
    CvMessage.success(t('fw.capturePoint.addSuccess'));
  } else {
    CvMessage.error(res.data.msg || t('fw.capturePoint.addFailed'));
  }
};

const handleReset = () => {
  formData.value = {};
  handleSearch();
};

//批量删除测点
const handleBatchDelete = () => {
  CvMessageBox.confirm(
      t('fw.capturePoint.confirmDeleteSelected').replace('{count}', String(selectedCount.value)),
      t('fw.capturePoint.confirmDeleteTitle'),
      {
        confirmButtonText: t('fw.common.delete'),
        cancelButtonText: t('fw.common.cancel'),
        type: 'warning',
      }
  )
      .then(async () => {
        await collectRef.value?.batchDelete();
        selectedCount.value = 0;
      })
      .catch(() => {
      });
};

const handleSelectionChange = (rows: any[]) => {
  selectedCount.value = rows.length;
};

//点表导出
const handleExport = () => {
  const rid = props.node.parent.data.id;
  const did = props.node.data.id;
  const token = sessionStorage.getItem('token');
  const tokenType = sessionStorage.getItem('tokenType');

  axios
      .get(`/api/v1/log/dbcfg/rtu/${rid}/device/${did}/excel`, {
        responseType: 'blob',
        headers: {
          'Authorization': `${tokenType} ${token}`,
        },
      })
      .then(res => {
        if (res.data) {
          const blob = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${props.node.data.name}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      })
      .catch(err => {
        console.error('导出失败:', err);
      });
};
</script>
<style scoped lang="scss">
:deep(.cv-table .el-table__body-wrapper tr td.el-table-fixed-column--left.is-last-column::before) {
  box-shadow: none !important;
}

.point-type-tabs {
  height: 100%;
  width: 100%;

  :deep(.el-tabs__header) {
    margin: 0;
    height: 100%;
    border-bottom: none;
  }

  :deep(.el-tabs__nav-wrap) {
    height: 100%;

    &::after {
      display: none;
    }
  }

  :deep(.el-tabs__nav-scroll),
  :deep(.el-tabs__nav) {
    height: 100%;
  }

  :deep(.el-tabs__item) {
    height: 48px;
    padding: 0 20px;
    line-height: 48px;
    color: #5c6373;
    font-size: 14px;
    font-weight: 400;
  }

  :deep(.el-tabs__item.is-active) {
    color: #1a2233;
    font-weight: 600;
  }

  :deep(.el-tabs__item:hover) {
    color: #1a2233;
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    background-color: #1a2233;
    border-radius: 2px;
  }
}

:deep(.cv-upload__file-list) {
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

.main-contain {
  height: 100%;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.main-contain__header {
  height: 48px;
  background: transparent;
  border-bottom: 1px solid #ebebeb;
  padding: 0 16px;
  display: flex;
  align-items: center;
}

.main-contain__center {
  padding: 16px;
  background: transparent;
  height: calc(100% - 48px);
}

.form-container {
  display: flex;
  flex-wrap: nowrap;
}

.extra {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.divider {
  border-bottom: 1px dashed #e5e6ea;
  margin: 12px 0;
}

.w-cm {
  width: 180px;
}

.empty-bg {
  background: #fff;
  border-radius: 12px;
}

.custom-tree-node-cont {
  width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-container {
  height: calc(100% - 40px - 24px);
  width: 100%;
}

.primary-btn {
  color: #2978FF;
  border-color: #2978FF;
}

.add-btn {
  display: inline-flex;
  align-items: center;

  &__icon {
    width: 12px;
    height: 12px;
    margin-right: 4px;
    color: #2978FF;
    transform: translateY(-1px);
    flex-shrink: 0;
  }
}
</style>
