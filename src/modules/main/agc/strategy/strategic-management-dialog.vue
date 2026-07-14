<template>
    <cv-dialog
        v-model="visible"
        width="800"
        title="添加策略"
        :draggable="true"
        :submit="submit"
        :submit-text="t('fw.common.confirm')"
        label-width="130px"
        @close="cancel"
    >
        <cv-checkbox-group v-if="options.length" v-model="checkList">
            <cv-checkbox v-for="item in options" :key="item.name" :value="item.name" :label="item.desc" />
        </cv-checkbox-group>
        <div v-else>
            <Empty height="100px" />
        </div>
        <template #footer>
            <cv-button @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
            <cv-button type="primary" @click="submit">{{ t('fw.common.confirm') }}</cv-button>
        </template>
    </cv-dialog>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {onMounted, ref} from 'vue';
import StrategicManagementService from '@/modules/main/agc/strategy/strategic-management.service';
import Empty from '@/common/empty.vue';

const {t} = useLocale();
const emit = defineEmits(['refresh']);

const visible = ref(false);
const checkList = ref([]);
const rowOptions = ref<{name: string,desc: string}[]>([]);
const options = ref<{name: string,desc: string}[]>([]);
onMounted(() => {
    StrategicManagementService.getStrategyList().then(res => {
        if (res.state) {
            rowOptions.value = res.data;
        }
    });
});
const open = (data: any) => {
    const initData = data?.map(item => item.name) ?? [];
    options.value = rowOptions.value.filter(item => !initData.includes(item.name));
    visible.value = true;
};

const submit = () => {
    if (!checkList.value.length) {
        return;
    }
    StrategicManagementService.createStrategy(checkList.value.map(item => ({name: item}))).then(res => {
        if (res.state) {
            CvMessage.success('操作成功');
            emit('refresh');
            cancel();
        }
    });
};
const cancel = () => {
    visible.value = false;
    checkList.value = [];
};
defineExpose({
    open,
    cancel,
});
</script>

<style lang="scss" scoped>
.w-cm {
    width: 320px;
}

.el-checkbox {
    border: 1px solid #d8dbe1;
    padding: 20px 48px;
    border-radius: 4px;
    margin-bottom: 12px;
}

.is-checked {
    border-color: var(--el-checkbox-checked-text-color);
}

</style>
