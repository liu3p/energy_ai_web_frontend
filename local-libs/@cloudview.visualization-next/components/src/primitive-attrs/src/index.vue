<template>
    <div class="vis-primitive-attrs">
        <cv-tabs
            v-model="activeTab"
            type="capsulePlain"
            :panes="panes"
            :stretch="true"
            class="vis-primitive-attrs__tab"
        ></cv-tabs>
        <div v-show="activeTab === paneKeys.PROPERTY" class="vis-primitive-attrs__search">
            <cv-select v-model="selectedTag" size="small">
                <cv-option v-for="item in tags" :key="item.value" :value="item.value" :label="item.label"></cv-option>
            </cv-select>
            <span class="vis-primitive-attrs__split"></span>
            <cv-input v-model="keywords" size="small" type="search" :placeholder="t('vis.common.search')"></cv-input>
        </div>
        <cv-scrollbar>
            <div v-if="activeTab === paneKeys.PROPERTY" class="vis-primitive-attrs__container">
                <template v-for="item in filterAttrs" :key="item.id">
                    <vis-attr-input
                        v-model="values[item.id]"
                        :config="item"
                        :show-binding="!props.inPrimitive"
                        :show-edit="props.inPrimitive && item.attrType === 'userDefined'"
                        :show-id="true"
                        :has-binding="hasBinding(item.id)"
                        @show-data-binding="emit('showDataBinding', item.id)"
                        @edit="config => emit('edit', config)"
                    ></vis-attr-input>
                </template>
            </div>
            <div v-if="activeTab === paneKeys.STATUS" class="vis-primitive-attrs__container">
                <div v-if="props.statusList.length === 0" class="vis-primitive-attrs__no-data">
                    {{ t('vis.primitive.noStatus') }}
                </div>

                <div v-else class="vis-primitive-attrs__status">
                    <div v-if="props.inPrimitive" class="vis-primitive-attrs__status-relationship">
                        <cv-checkbox v-model="values.statusMutualExclusion" @change="onStatusRelationshipChange">
                            {{ t('vis.primitive.statusMutualExclusion') }}
                        </cv-checkbox>
                    </div>
                    <div v-for="(item, index) in filterStatus" :key="index" class="vis-primitive-attrs__status-item">
                        <div class="vis-primitive-attrs__status-img">
                            <img :src="item.src" />
                        </div>
                        <div style="justify-self: start">
                            <cv-checkbox
                                v-model="status[index]"
                                :label="item.name"
                                @change="onStatusChange($event, index)"
                            ></cv-checkbox>
                        </div>
                        <div>
                            <cv-button
                                v-if="!props.inPrimitive"
                                class="vis-primitive-attrs__status-binding"
                                :class="{'is-binding': hasBinding(statusPrefix + index)}"
                                size="small"
                                type="primary"
                                text
                                @click="emit('showDataBinding', `${statusPrefix}${index}`)"
                            >
                                {{ t('vis.property.dataBinding') }}
                            </cv-button>
                        </div>
                    </div>
                </div>
            </div>
        </cv-scrollbar>

        <div v-if="props.inPrimitive && activeTab === paneKeys.PROPERTY" class="vis-primitive-attrs__add-button">
            <cv-button @click="emit('add')">{{ t('vis.property.createAttribute') }}</cv-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {computed, ref, type WritableComputedRef} from 'vue';
import type {
    IAttributes,
    IPrimitiveAttrConfig,
    IPrimitiveBindings,
    IStatus,
    IStatusInfo,
    ISvgAttr,
    IUserDefined,
} from '@cloudview.visualization-next/services';
import {provideObserver, statusPrefix} from '@cloudview.visualization-next/services';
import VisAttrInput from '../../attr-input';

defineOptions({name: 'PrimitiveAttrs'});

const {t} = useLocale();
const observer = provideObserver();

interface IProps {
    configs: IPrimitiveAttrConfig;
    values: IAttributes;
    userDefinedConfigs: IUserDefined;
    bindings?: IPrimitiveBindings;
    inPrimitive?: boolean;
    justShowHasBinding?: boolean;
    status: IStatus;
    statusList: IStatusInfo[];
}

const props = withDefaults(defineProps<IProps>(), {
    inPrimitive: false,
    justShowHasBinding: false,
    bindings: () => ({}),
});

const emit = defineEmits(['showDataBinding', 'add', 'edit', 'update:values']);

const values: WritableComputedRef<IAttributes> = computed({
    get() {
        return props.values;
    },
    set(val) {
        emit('update:values', val);
    },
});

enum paneKeys {
    PROPERTY = 'property',
    STATUS = 'status',
}

const panes = [
    {
        label: t('vis.common.property'),
        name: paneKeys.PROPERTY,
    },
    {
        label: t('vis.common.state'),
        name: paneKeys.STATUS,
    },
];

const activeTab = ref<paneKeys>(paneKeys.PROPERTY);

const selectedTag = ref('');
const keywords = ref('');

const tags = computed(() => {
    const res = [
        {
            value: '',
            label: t('vis.common.all'),
        },
    ];
    const set = new Set<string>();
    Object.values(Object.assign({}, props.configs, props.userDefinedConfigs)).forEach(item => {
        if ((props.inPrimitive && item.hiddenInPrimitive) || item.tag.trim() === '') {
            return;
        }
        set.add(item.tag);
    });
    return res.concat(
        Array.from(set).map(i => {
            return {
                value: i,
                label: i,
            };
        })
    );
});

const filterAttrs = computed(() => {
    const res = {};
    const configs = Object.assign({}, props.userDefinedConfigs, props.configs);
    for (const key in configs) {
        const item = configs[key];
        const name = t(item.name) + item.id.toLowerCase();
        if (props.inPrimitive && item.hiddenInPrimitive) {
            continue;
        }
        if (props.justShowHasBinding && !hasBinding(item.id)) {
            continue;
        }
        if (name.includes(keywords.value.trim().toLowerCase())) {
            if (selectedTag.value.length === 0) {
                res[key] = item;
            } else if (item.tag === selectedTag.value) {
                res[key] = item;
            }
        }
    }
    return res;
});

const filterStatus = computed(() => {
    return props.statusList.filter(
        item => !props.justShowHasBinding || (props.justShowHasBinding && hasBinding(statusPrefix + item.index))
    );
});

const hasBinding = (attr: string) => !!props.bindings && Reflect.has(props.bindings, attr);

const changeStatus = (status, key, val) => {
    status[key] = val;
};

// 图元状态
const cancelAllStatus = () => Object.keys(props.status).forEach(key => changeStatus(props.status, key, false));
const onStatusRelationshipChange = value => {
    if (value) {
        cancelAllStatus();
        // props.status[0] = true;
        changeStatus(props.status, 0, true);
    }
};

const status = computed(() => {
    return {...props.status};
});

const onStatusChange = (value, index) => {
    if ((props.values as ISvgAttr).statusMutualExclusion) {
        if (value) {
            cancelAllStatus();
        }
        // props.status[index] = true;
        changeStatus(props.status, index, true);
    } else {
        if (!value && Object.values(status.value).filter(item => item).length === 0) {
            // props.status[index] = true;
            changeStatus(props.status, index, true);
            CvMessage({
                type: 'warning',
                message: t('vis.primitive.noStatusShow'),
            });
        } else {
            // props.status[index] = value;
            changeStatus(props.status, index, value);
        }
    }
};
</script>
