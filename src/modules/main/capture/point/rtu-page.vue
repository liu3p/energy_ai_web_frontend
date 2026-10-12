<template>
  <div class="rtu-container">
    <cv-scrollbar height="100%">
      <cv-form ref="ruleFormRef" :rules="rules" :inline="true" :model="form">
        <div class="rtu-contain__header">
          <span>{{ t('fw.capturePoint.rtuInfo') }}</span>
          <cv-form-item style="margin: 0">
            <cv-button type="primary" size="mini" @click="save">{{ t('fw.capturePoint.save') }}</cv-button>
          </cv-form-item>
        </div>
        <div class="rtu-contain__center">
          <cv-form-item :label="t('fw.capturePoint.rtuName')" prop="name" required>
            <cv-input v-model="form.name"></cv-input>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.rtuType')">
            <cv-input :model-value="rtuTypeLabel" disabled />
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.rtuId')">
            <cv-input v-model="form.id" disabled></cv-input>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.rtuAddr')" prop="rtuaddr">
            <cv-input v-model.trim="form.rtuaddr" disabled/>
          </cv-form-item>
          <cv-form-item :label="t('fw.capturePoint.forTransfer')" prop="for_transfer">
            <cv-switch v-model="form.for_transfer" active-value="1" inactive-value="0"
                       style="width: 100px;" disabled/>
          </cv-form-item>
          <div class="rtu-contain__header-sub">
            <span>{{ t('fw.capturePoint.channelInfo') }}</span>
          </div>
          <div class="rtu-contain__center">
            <cv-scrollbar height="100%">
              <div class="channel-meta-row">
                <cv-form-item :label="t('fw.capturePoint.channelName')" prop="channel.name">
                  <cv-input v-model="form.channel.name" disabled></cv-input>
                </cv-form-item>
                <cv-form-item :label="t('fw.capturePoint.channelId')">
                  <cv-input :model-value="form.channel?.servergroup" disabled></cv-input>
                </cv-form-item>
              </div>
              <div
                  v-for="(layer, index) in visibleLayerStates"
                  :key="layer.type"
                  class="protocol-layer-block"
                  :class="{'is-first': index === 0}"
              >
                <div class="protocol-layer-header">
                  <cv-form-item :label="layerLabel(layer.type)">
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
                  <button
                      type="button"
                      class="protocol-layer-add"
                      :class="{'is-noop': Number(layer.type) >= 3}"
                      @click="handleLayerToggle(layer.type)"
                  >
                    {{ getLayerToggle(layer.type) === 'minus' ? '−' : '+' }}
                  </button>
                </div>
                <div class="protocol-layer-table">
                  <cv-table :data="layer.selected?.parameters ?? []" style="width: 100%">
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
import {getRtuTypeById} from '@/modules/main/capture/point/point.model';
import {normalizePossibleOwnerIds} from '@/modules/main/capture/point/point.service';
import {getPlugins} from '@/modules/main/capture/channel/channel.service';
import {
  buildLayerStates,
  buildPluginsPayload,
  filterVisibleLayerStates,
  getProtocolLayerLabelKey,
  normalizePluginLayers,
  selectLayerPlugin,
  type LayerState,
  type ProtocolLayer,
} from '@/modules/main/capture/channel/protocol-layers';

const {t} = useLocale();

const emit = defineEmits(['submit']);
const props = defineProps<{
  data: any;
}>();

const rtuTypeLabel = computed(() => {
  const matched = getRtuTypeById(form.value?.id);
  return matched ? t(`fw.capturePoint.rtuTypeOption.${matched.value}`) : '';
});

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
  channel: {
    name: '',
    id: '',
  },
});

const catalogLayers = ref<ProtocolLayer[]>([]);
const layerStates = ref<LayerState[]>(buildLayerStates([], []));
const pendingSavedPlugins = ref<any[] | null>(null);
/** 已展开到第几层：默认只展示第1层，最多 3 */
const visibleLayerCount = ref(1);

const visibleLayerStates = computed(() =>
  filterVisibleLayerStates(layerStates.value, visibleLayerCount.value)
);

const layerLabel = (type: string) =>
  t(`fw.capturePoint.${getProtocolLayerLabelKey(type)}`).replace('{n}', type);

/** 未展开更高层 → +；已展开更高层 → −；第3层始终显示 +（点击无效果） */
const getLayerToggle = (type: string): 'plus' | 'minus' => {
  const t = Number(type);
  if (t < visibleLayerCount.value) return 'minus';
  return 'plus';
};

const handleLayerToggle = (type: string) => {
  const action = getLayerToggle(type);
  // 第3层按钮仅展示，点击无反应
  if (Number(type) >= 3) return;
  if (action === 'plus' && visibleLayerCount.value < 3) {
    visibleLayerCount.value += 1;
  } else if (action === 'minus') {
    // 收起：只隐藏更高层，保留其已选内容，再次展开可恢复
    visibleLayerCount.value = Number(type);
  }
};

const applyLayerStates = (savedPlugins: any[] = []) => {
  layerStates.value = buildLayerStates(catalogLayers.value, savedPlugins);
  // 默认只展示第1层，需点击「+」再逐层展开
  visibleLayerCount.value = 1;
};

onMounted(() => {
  getPlugins().then(res => {
    if (res.state) {
      catalogLayers.value = normalizePluginLayers(res.data);
      applyLayerStates(pendingSavedPlugins.value ?? form.value?.channel?.plugins ?? []);
      pendingSavedPlugins.value = null;
    }
  });
});

const save = () => {
  ruleFormRef.value.validate((valid: any) => {
    if (valid) {
      const {channel, ...restForm} = form.value;
      const {
        plugins: _oldPlugins,
        appplugin: _app,
        linkplugin: _link,
        ...restChannel
      } = channel ?? {};
      // 按接口文档改动后：channel.plugins 仅 {id, parameters}，按层升序
      emit('submit', {
        ...restForm,
        channel: {
          ...restChannel,
          possibleowner: normalizePossibleOwnerIds(restChannel?.possibleowner),
          plugins: buildPluginsPayload(
            filterVisibleLayerStates(layerStates.value, visibleLayerCount.value)
          ),
        },
      });
    }
  });
};

const handleLayerChange = (type: string, id: string | number | '') => {
  layerStates.value = layerStates.value.map(layer =>
      layer.type === type ? selectLayerPlugin(layer, id) : layer
  );
};

watch(() => props.data, (values) => {
  const cloned = _.cloneDeep(values) ?? {
    name: '',
    type: '',
    id: '',
    memofcabinet: '',
    rtuaddr: '',
  };
  form.value = {
    ...cloned,
    type: cloned?.type ?? '',
    channel: {
      name: '',
      id: '',
      ...(cloned?.channel ?? {}),
    },
  };
  const plugins = values?.channel?.plugins ?? [];
  if (catalogLayers.value.length) {
    applyLayerStates(plugins);
  } else {
    pendingSavedPlugins.value = plugins;
  }
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

.channel-meta-row {
  display: block;
  width: 100%;
}

.protocol-layer-block {
  display: block;
  width: 100%;
  margin-top: 16px;

  &.is-first {
    margin-top: 0;
  }
}

.protocol-layer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.protocol-layer-add {
  flex-shrink: 0;
  margin-top: 4px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #3162e1;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    border-color: #3162e1;
    background: #f0f5ff;
  }

  &.is-noop {
    cursor: default;
  }
}

.protocol-layer-table {
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: scroll;
}

</style>
