<template>
  <div class="rtu-container">
    <cv-scrollbar height="100%">
      <cv-form ref="ruleFormRef" :rules="rules" :inline="true" :model="form">
        <div class="rtu-contain__header">
          <span>{{ t('fw.capturePoint.rtuInfo') }}</span>
          <cv-form-item style="margin: 0">
            <cv-button size="mini" @click="save">{{ t('fw.capturePoint.save') }}</cv-button>
          </cv-form-item>
        </div>
        <div class="rtu-contain__center">
          <cv-form-item :label="t('fw.capturePoint.rtuName')" prop="name" required>
            <cv-input v-model="form.name"></cv-input>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.rtuType')">
            <cv-select
                v-model="form.type"
                disabled
            >
              <cv-option
                  v-for="item in rtuTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </cv-select>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.rtuId')">
            <cv-input v-model="form.id" disabled></cv-input>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.rtuAddr')" prop="rtuaddr">
            <cv-input v-model.trim="form.rtuaddr" disabled/>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.memofcabinet')" prop="memofcabinet">
            <cv-input v-model.trim="form.memofcabinet" :controls="false" class="w-cm"/>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.channelGroupId')" prop="channelgroupid">
            <cv-input v-model.trim="form.channelgroupid" disabled/>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.channelGroupName')" prop="channelgroupname">
            <cv-input v-model.trim="form.channelgroupname" disabled/>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.forTransfer')" prop="for_transfer">
            <cv-switch v-model="form.for_transfer" active-value="1" inactive-value="0"
                       style="width: 100px;"/>
          </cv-form-item>
          <div class="rtu-contain__header-sub">
            <span>{{ t('fw.capturePoint.channelInfo') }}</span>
          </div>
          <div class="rtu-contain__center">
            <cv-scrollbar height="100%">
              <cv-form-item :label="t('fw.capturePoint.appProtocol')">
                <cv-select
                    v-model="form.appPluginId"
                    filterable
                    @change="handleAppChange"
                >
                  <cv-option
                      v-for="item in appPluginOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                  />
                </cv-select>
              </cv-form-item>
              <cv-form-item :label="t('fw.capturePoint.channelName')" prop="channel.name">
                <cv-input v-model="form.channel.name" disabled></cv-input>
              </cv-form-item>
              <cv-form-item :label="t('fw.capturePoint.channelId')">
                <cv-input v-model="form.channel.id" disabled></cv-input>
              </cv-form-item>
              <div>
                <cv-table :data="appPluginTable?.parameters ?? []" style="width: 100%">
                  <cv-table-column type="index" :label="t('fw.common.number')" width="80"/>
                  <cv-table-column prop="name" :label="t('fw.capturePoint.param')"/>
                  <cv-table-column :label="t('fw.capturePoint.dataType')"/>
                  <cv-table-column prop="value" :label="t('fw.capturePoint.value')">
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
                  <cv-table-column :label="t('fw.capturePoint.valueRange')"/>
                  <cv-table-column :label="t('fw.capturePoint.remark')"/>
                </cv-table>
              </div>
              <div>
                <cv-form-item :label="t('fw.capturePoint.linkProtocol')" style="margin-top: 16px ;">
                  <cv-select
                      v-model="form.linkPluginId"
                      filterable
                      @change="handleLinkChange"
                  >
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
                  <cv-table-column type="index" :label="t('fw.common.number')" width="80"/>
                  <cv-table-column prop="name" :label="t('fw.capturePoint.param')"/>
                  <cv-table-column :label="t('fw.capturePoint.dataType')"/>
                  <cv-table-column prop="value" :label="t('fw.capturePoint.value')">
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
                  <cv-table-column :label="t('fw.capturePoint.valueRange')"/>
                  <cv-table-column :label="t('fw.capturePoint.remark')"/>
                </cv-table>
              </div>
            </cv-scrollbar>
          </div>
        </div>
      </cv-form>

    </cv-scrollbar>
  </div>
</template>
<script setup lang="ts">
import {ref, reactive, watch, onMounted, computed} from 'vue';
import _ from 'lodash';
import {useLocale} from 'cloudview.ui-next';
import {RTUTYPE} from '@/modules/main/capture/point/point.model';
import {getPlugins,} from '@/modules/main/capture/channel/channel.service';

const {t} = useLocale();

const emit = defineEmits(['submit']);
const props = defineProps<{
  // data: { name: string, type: string, id: string, memofcabinet: string, rtuaddr: string }
  data: any;
}>();

const rtuTypeOptions = computed(() =>
  RTUTYPE.map(item => ({
    ...item,
    label: t(`fw.capturePoint.rtuTypeOption.${item.value}`),
  }))
);

const ruleFormRef = ref();
const rules = reactive({
  name: [
    {
      required: true,
      message: t('fw.common.pleaseInput'),
      trigger: 'blur',
    },
  ],
  'channel.name': [
    {
      required: true,
      message: t('fw.common.pleaseInput'),
      trigger: 'blur',
    },
  ]
});
const form = ref<any>({
  name: '',
  type: '',
  id: '',
  memofcabinet: '',
  rtuaddr: '',
  appPluginId: '',
  linkPluginId: '',
});

const appPluginOptions = ref();
const linkPluginOptions = ref();
const appPluginTable = ref();
const linkPluginTable = ref();

onMounted(() => {
  getPlugins().then(res => {
    if (res.state) {
      const {appplugin, linkplugin} = res.data;
      appPluginOptions.value = appplugin;
      linkPluginOptions.value = linkplugin;
    }
  });
});

const save = () => {
  ruleFormRef.value.validate((valid: any) => {
    if (valid) {
      const {channel, ...restForm} = form.value;
      const {plugins, ...restChannel} = channel ?? {};
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
        ...restForm,
        channel: {
          ...restChannel,
          plugins: [appplugin, linkplugin],
        },
      });
    }
  });
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

const formatLinkValueList = () => {
  const sourceLinkPlugin = linkPluginOptions.value?.find((opt: any) => opt.id === linkPluginTable.value.id);
  if (sourceLinkPlugin?.parameters && linkPluginTable.value?.parameters) {
    const paramMap = new Map(sourceLinkPlugin.parameters.map((p: any) => [p.name, p.valuelist]));
    linkPluginTable.value.parameters.forEach((param: any) => {
      param.valuelist = paramMap.get(param.name);
    });
  }
};

const handleLinkChange = (id: string) => {
  linkPluginTable.value = linkPluginOptions.value?.find((item: any) => item.id === id);
};

const handleAppChange = (id: string) => {
  appPluginTable.value = appPluginOptions.value?.find((item: any) => item.id === id);
};

watch(() => props.data, (values) => {
  console.log(values);
  form.value = _.cloneDeep(values);
  const plugins = values?.channel?.plugins ?? [];
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
}, {immediate: true});
</script>
<style scoped lang="scss">
.rtu-container {
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  overflow: hidden;
}

.rtu-contain__header {
  height: 48px;
  background: transparent;
  padding: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: none;
  border-bottom: 1px solid #EBEBEB;
}

.rtu-contain__header-sub {
  height: 48px;
  background: transparent;
  padding: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #EBEBEB;
}

.rtu-contain__center {
  padding: 16px;
  background: transparent;
  height: calc(100% - 48px);
  overflow: hidden;
}

.bold-text {
  color: #35353E;
  font-weight: bold;
}

</style>
