<template>
    <div class="rtu-container">
        <cv-form ref="ruleFormRef" :rules="rules" :inline="true" :model="form">
            <div class="rtu-contain__header">
                <span>基础信息</span>
                <cv-form-item style="margin: 0">
                    <cv-button size="mini" @click="save">保存</cv-button>
                </cv-form-item>
            </div>
            <div class="rtu-contain__center">
                <cv-form-item label="RTU名称" prop="name" required>
                    <cv-input v-model="form.name"></cv-input>
                </cv-form-item>
                <cv-form-item label="RTU类型">
                    <cv-select
                        v-model="form.type"
                        disabled
                    >
                        <cv-option
                            v-for="item in RTUTYPE"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </cv-select>
                </cv-form-item>
                <cv-form-item label="RTU ID">
                    <cv-input v-model="form.id" disabled></cv-input>
                </cv-form-item>
                <cv-form-item label="RTU地址" prop="rtuaddr">
                    <cv-input v-model.trim="form.rtuaddr" disabled/>
                </cv-form-item>
                <cv-form-item label="所属储能柜" prop="memofcabinet">
                    <cv-input v-model.trim="form.memofcabinet" :controls="false" class="w-cm" />
                </cv-form-item>
            </div>
        </cv-form>
    </div>
</template>
<script setup lang="ts">
import {ref, reactive, watch} from 'vue';
import _ from 'lodash';
import {RTUTYPE} from '@/modules/main/capture/point/point.model';

const emit = defineEmits(['submit']);
const props = defineProps<{
    data: {name: string, type: string, id: string, memofcabinet: string, rtuaddr: string}
}>();

const ruleFormRef = ref();
const rules = reactive({
    name: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ]
});
const form = ref({
    name: '',
    type: '',
    id: '',
    memofcabinet: '',
    rtuaddr: '',
});

const save = () => {
    ruleFormRef.value.validate((valid: any) => {
        if (valid) {
            emit('submit', form.value);
        }
    });
};

watch(() => props.data, (values) => {
    form.value = _.cloneDeep(values);
}, {immediate: true});
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
    border-bottom: 1px solid #EBEBEB;
}

.rtu-contain__center {
    padding: 16px;
    background: #fff;
    height: calc(100% - 48px);
    overflow: hidden;
}

.bold-text {
    color: #35353E;
    font-weight: bold;
}

</style>