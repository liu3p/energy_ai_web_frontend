<template>
    <div class="main-contain__header">
        <cv-tabs
            v-model="activeName"
            type="card"
            :panes="panes"
            style="height: 48px"
            @tab-click="handleChange"
        ></cv-tabs>
    </div>
    <div class="main-contain__center">
        <cv-scrollbar style="height: 40px">
            <cv-form ref="formRef" inline :model="formData" class="form-container">
                <cv-form-item label="搜索">
                    <cv-input
                        v-model.trim="formData.name"
                        placeholder="请输入参数名称"
                        clearable
                        class="w-cm"
                        @input="handleSearch"
                    />
                </cv-form-item>
            </cv-form>
        </cv-scrollbar>
        <div class="divider"></div>
        <div class="table-container">
            <points
                ref="pointsRef"
                :active="activeName"
                :data="rowDataSource"
                :pageTotal="pageInfo.total"
                :rid="rid"
                :did="did"
                :device-name="props.node.data.name"
                @page-change="handleChangePage"
            />
        </div>
    </div>
</template>
<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import Points from '@/modules/main/capture/monitor/points.page.vue';
import {pointType} from '@/modules/main/capture/point/point.model';
import {WebsocketClass} from '@/common/websocket/websocket.class';
import {initWebsocket} from '@/modules/main/capture/monitor/monitor.service';

const props = defineProps<{
    node: any;
}>();

const rid = computed(() => props.node.parent?.data?.id);
const did = computed(() => props.node.data?.id);
const activeName = ref('analog');
const formData = ref<{
    name?: string;
}>({});
const panes = ref<
    {
        label: string | number;
        name: string | number;
    }[]
>(pointType);
const socket = ref<WebsocketClass>();
const rowDataSource = ref([]);
const reConnect = ref(true);

const init = async () => {
    socket.value = await initWebsocket(rid.value, did.value, activeName.value);
    socket.value.connect();
    socket.value.onMessage(onMessage);
    initPage();
    rowDataSource.value = [];
    reConnect.value = true;
};
const handleChange = () => {
    closeSocket();
    init();
};
watch(
    () => props.node.data.id,
    value => {
        activeName.value = 'analog';
        socket && closeSocket();
        init();
    },
    {immediate: true}
);
function onMessage(msg: any) {
    if (!msg) {
        return;
    }
    const data = JSON.parse(msg);
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        pageInfo.value.total = data.total;
        if (reConnect.value) {
            reConnect.value = false;
            getPointList();
        }
    } else {
        rowDataSource.value = data;
    }
}

function closeSocket() {
    socket.value?.offMessage(onMessage);
    socket.value?.close();
}
const pageInfo = ref<{currentPage: number; pageSize: number; total: number}>({
    currentPage: 1,
    pageSize: 10,
    total: 0,
});
const handleChangePage = (info: {currentPage: number; pageSize: number}) => {
    pageInfo.value = {...pageInfo.value, ...info};
    getPointList();
};
const pointsRef = ref<HTMLDivElement | null>(null);
const initPage = () => {
    pageInfo.value = {
        ...pageInfo.value,
        currentPage: 1,
        total: 0,
    };
    pointsRef.value?.initPage(pageInfo.value);
};

const getPointList = (isSearch?: boolean) => {
    socket.value?.send(
        JSON.stringify({
            code: isSearch ? 2 : formData.value.name !== undefined && formData.value.name !== '' ? 3 : 1,
            name: formData.value.name,
            page: pageInfo.value.currentPage - 1,
            pagesize: pageInfo.value.pageSize,
        })
    );
};
let searchTimer: ReturnType<typeof setTimeout> | null = null;
const handleSearch = () => {
    if (searchTimer) {
        clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
        initPage();
        reConnect.value = true;
        getPointList(true);
    }, 1000);
};
onUnmounted(() => {
    closeSocket();
    if (searchTimer) {
        clearTimeout(searchTimer);
    }
});
</script>
<style scoped lang="scss">
:deep(.el-tabs__header) {
    margin: 0;
}

:deep(.el-tabs__nav) {
    gap: 16px;

    .el-tabs__item {
        background: #e6e6e6;
        border: none !important;
        border-radius: 12px;
    }

    .is-active {
        background: #3162e1 !important;
        color: #fff;
    }
}

:deep(.el-form-item) {
    margin-bottom: 0;
}

.main-contain__header {
    height: 66px;
    background: #fff;
    border-bottom: 1px solid #ebebeb;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.main-contain__center {
    padding: 16px;
    background: #fff;
    height: calc(100% - 66px);
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
</style>
