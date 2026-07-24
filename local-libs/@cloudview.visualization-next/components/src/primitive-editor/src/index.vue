<template>
    <div class="vis-primitive-editor">
        <vis-primitive-editor-header
            :title="primitive?.name ?? ''"
            :save-enabled="isEdited"
            @save="saveEdit"
            @definition="openDefinition"
        ></vis-primitive-editor-header>
        <div v-loading="loading" class="vis-primitive-editor__body">
            <div class="vis-primitive-editor__primitive">
                <svg ref="svgStage" width="100%" height="100%">
                    <vis-primitive v-if="primitiveInstance" :model="primitiveInstance"></vis-primitive>
                </svg>
            </div>
            <div
                class="vis-primitive-editor__add-panel"
                :class="{'vis-primitive-editor__add-panel--show': addPanelVisible}"
            >
                <vis-attr-add
                    v-if="primitive"
                    ref="attrAdd"
                    :prefix-name="t('vis.common.property')"
                    :groups="tags"
                    :forbidden-keys="Object.keys(primitive?.attributes).concat(['x', 'y'])"
                    @close="closeAddPanel"
                    @submit="addAttr"
                    @delete="deleteAttr"
                ></vis-attr-add>
            </div>
            <div class="vis-primitive-editor__attrs">
                <vis-primitive-attrs
                    v-if="primitive"
                    :in-primitive="true"
                    :configs="primitive?.defaultConfig"
                    :user-defined-configs="primitive?.userDefined"
                    :values="primitive?.attributes"
                    :status="primitive?.status"
                    :status-list="
                        primitive?.type === PrimitiveTypeAllEnum.SVG && primitive?.model ? primitive.statusList : []
                    "
                    @edit="showAddPanel"
                    @add="showAddPanel"
                ></vis-primitive-attrs>
            </div>
        </div>
    </div>
    <vis-obj-definition-dialog
        ref="defDialog"
        v-model:formModel="primitiveConfig"
        :title="t('vis.primitive.primitiveDefinition')"
        :get-tags="getTags"
        :check-name="PrimitiveApi.checkName"
        upload-disabled
        :submit="saveModified"
        is-edit
    ></vis-obj-definition-dialog>
</template>
<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import VisPrimitiveEditorHeader from './primitive-editor-header.vue';
import VisPrimitiveAttrs from '../../primitive-attrs';
import VisAttrAdd from '../../attr-add';
import VisPrimitive from '../../primitive';
import {computed, onMounted, ref, watch} from 'vue';
import VisObjDefinitionDialog from '../../obj-definition-dialog';
import {
    type IAttrDef,
    type IPrimitive,
    ObjectApi,
    Primitive,
    PrimitiveApi,
    PrimitiveFactory,
    PrimitiveInstance,
    PrimitiveInstanceFactory,
    PrimitiveTypeAllEnum,
} from '@cloudview.visualization-next/services';
import {onBeforeRouteLeave, useRoute, useRouter} from 'vue-router';

defineOptions({name: 'VisPrimitiveEditor'});
const {t} = useLocale();
const route = useRoute();
const router = useRouter();
const primitive = ref<Primitive>();
const primitiveInstance = ref<PrimitiveInstance>();
const loading = ref(true);
const {getTags} = PrimitiveApi;

// 新增属性
const attrAdd = ref();
const tags = computed(() => {
    const set = new Set<string>();
    Object.values(Object.assign({}, primitive.value?.defaultConfig, primitive.value?.userDefined)).forEach(item => {
        if (item.hiddenInPrimitive) {
            return;
        }
        if (item.tag === '') {
            return;
        }
        set.add(item.tag);
    });
    return Array.from(set).map(i => {
        return {
            value: i,
            label: i,
        };
    });
});

const addPanelVisible = ref(false);
const showAddPanel = (attrConfig?: IAttrDef) => {
    attrAdd.value.show(attrConfig);
    addPanelVisible.value = true;
};
const closeAddPanel = () => {
    addPanelVisible.value = false;
};
const addAttr = (attrConfig: IAttrDef) => {
    primitive.value!.userDefined[attrConfig.id] = attrConfig;
    primitive.value!.attributes![attrConfig.id] = attrConfig.value;
    addPanelVisible.value = false;
};
const deleteAttr = (attrId: string) => {
    Reflect.deleteProperty(primitive.value!.userDefined, attrId);
    Reflect.deleteProperty(primitive.value!.attributes!, attrId);
    addPanelVisible.value = false;
};

let isEdited = ref<boolean>(false);
const saveEdit = async () => {
    const result = await PrimitiveApi.modifyPrimitive(primitive.value!.id, primitive.value!.getConfig());
    if (result.state) {
        CvMessage({type: 'success', message: t('vis.common.successSave')});
        isEdited.value = false;
    } else {
        CvMessage({type: 'error', message: t('vis.common.failedSave')});
    }
};

const svgStage = ref();
const setPrimitiveInstanceXY = () => {
    const rect = svgStage.value.getBoundingClientRect();
    const attributes = primitiveInstance.value!.attributes as {x: number; y: number; width: number; height: number};
    attributes.x = (rect.width - attributes.width) / 2;
    attributes.y = (rect.height - attributes.height) / 2;
};

let oldPrimitiveConfig = '';
let editorTimer: number;

watch(
    () => primitive.value,
    _primitive => {
        window.clearTimeout(editorTimer);
        if (!isEdited.value && oldPrimitiveConfig) {
            editorTimer = window.setTimeout(() => {
                const newPrimitiveConfig = JSON.stringify(_primitive!.getConfig());
                if (oldPrimitiveConfig !== newPrimitiveConfig) {
                    isEdited.value = true;
                    oldPrimitiveConfig = newPrimitiveConfig;
                }
            }, 200);
        }
        primitiveInstance.value!.attributes = _primitive!.attributes!;
        setPrimitiveInstanceXY();
    },
    {deep: true}
);

onMounted(async () => {
    const primitiveResult = await PrimitiveApi.getPrimitiveById(route.params.id as string);
    if (primitiveResult.state) {
        const data = primitiveResult.data as IPrimitive;
        const modelResult = await ObjectApi.getAssets([data.model_id!]);
        if (modelResult.state) {
            primitive.value = PrimitiveFactory.getInstance(data);
            primitiveInstance.value = PrimitiveInstanceFactory.getInstance(data);
            oldPrimitiveConfig = JSON.stringify(primitive.value!.getConfig());
            const model = modelResult.data?.[0]?.content;
            primitive.value.setModel(model);
            (primitiveInstance.value as PrimitiveInstance & {setModel: (m: string) => void}).setModel(model);
            setPrimitiveInstanceXY();
        }
    }
    loading.value = false;
});

onBeforeRouteLeave(async (to, from, next) => {
    if (isEdited.value) {
        try {
            await CvMessageBox.confirm(t('vis.common.leavePrompt'), t('vis.common.prompt'));
            next();
        } catch {
            next(false);
        }
    } else {
        next();
    }
});

watch(isEdited, val => {
    if (val) {
        window.onbeforeunload = () => true;
    } else {
        window.onbeforeunload = null;
    }
});

const defDialog = ref();
const primitiveConfig = ref({} as IPrimitive);
const openDefinition = () => {
    primitiveConfig.value = JSON.parse(JSON.stringify(primitive.value!.getConfig()));
    defDialog.value.open();
};

const saveModified = () => {
    primitive.value!.setConfig(primitiveConfig.value);
    return true;
};
</script>
