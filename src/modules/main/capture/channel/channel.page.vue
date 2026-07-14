<template>
    <div class="container">
        <div class="side-tree__wrapper">
            <collapse-slider v-model="collapse" :width="sliderProps.width" :collapse-width="sliderProps.collapseWidth">
                <cv-button style="margin: 0 auto 8px; width: 100%" @click="addChannelGroupRef.open()"
                    >新增通道组
                </cv-button>
                <cv-tree
                    ref="treeRef"
                    :data="treeData"
                    :props="{
                        children: 'channel',
                        label: 'name',
                    }"
                    default-expand-all
                    @node-click="handleNodeClick"
                >
                    <template #default="{node, data}">
                        <div class="custom-tree-node">
                            <cv-tooltip :content="`${node.label}（${data.id}）`" placement="right">
                                <div class="custom-tree-node-cont">{{ node.label }}</div>
                            </cv-tooltip>
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
                                    <div v-if="node.level === 1" @click="nodeAdd(node, data)">新增通道</div>
                                    <div @click="removeNode(node, data)">删除</div>
                                </div>
                            </cv-popover>
                        </div>
                    </template>
                </cv-tree>
            </collapse-slider>
        </div>
        <div class="main-contain">
            <channel-info
                v-if="currentNode?.level === 1"
                :options="RtuOptions"
                :data="currentNode?.data"
                @submit="handleSubmitChannel"
            />
            <channel-setting
                v-else-if="currentNode?.level === 2"
                :data="currentNode?.data"
                @submit="handleUpdateChannel"
            />
            <empty v-else />
        </div>
        <add-channel-group ref="addChannelGroupRef" :options="RtuOptions" @submit="handleUpdateGroups" />
        <add-channel ref="addChannelRef" @submit="handleCreateChannel" />
    </div>
</template>
<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import CollapseSlider from '@/common/collapse-slider.vue';
import Empty from '@/common/empty.vue';
import ChannelInfo from '@/modules/main/capture/channel/channel-info.vue';
import {createDevice, delRtu, queryRtuListExceptPoints, updateDevice} from '@/modules/main/capture/point/point.service';
import AddChannelGroup from '@/modules/main/capture/channel/add-channel-group.dialog.vue';
import AddChannel from '@/modules/main/capture/channel/add-channel.vue';
import {CvMessageBox, CvMessage, useLocale} from 'cloudview.ui-next';
import ChannelSetting from '@/modules/main/capture/channel/channel-setting.vue';
import {
    createChannel,
    createChannelGroup,
    delChannel,
    delChannelGroup,
    getChannelGroup,
    updateChannel,
    updateChannelGroup,
} from '@/modules/main/capture/channel/channel.service';

const {t} = useLocale();
const sliderProps = {
    collapseWidth: '48px',
    width: '300px',
};
const sliderWidth = computed(() => {
    return collapse.value ? sliderProps.collapseWidth : sliderProps.width;
});
const addChannelGroupRef = ref();
const addChannelRef = ref();
const treeRef = ref();
const currentNode = ref();
const collapse = ref(false);
const treeData = ref<any[]>([]);
const RtuOptions = ref<
    {
        id: string;
        name: string;
    }[]
>([]);

const initChannelList = () => {
    getChannelGroup().then(res => {
        if (res.state) {
            treeData.value = res.data || [];
        }
    });
};
const initRtuList = () => {
    queryRtuListExceptPoints().then(res => {
        if (res.state) {
            RtuOptions.value = res.data;
        }
    });
};

onMounted(() => {
    initChannelList();
    initRtuList();
});

const nodeAdd = (node: any) => {
    if (node.childNodes?.length > 0) {
        return CvMessage.warning('每个通道组下只支持配置一个通道');
    }
    addChannelRef.value.open();
};

const removeNode = (node: any) => {
    if (node.level === 1 && node.childNodes?.length) {
        return CvMessageBox.alert('当前节点无法删除，请先删除子节点。', t('fw.common.tips'), {
            confirmButtonText: '取消',
        });
    }
    const id = node.data.id;
    if (node.level === 1) {
        CvMessageBox.confirm(t('fw.common.confirmDel'), t('fw.common.tips'), {
            type: 'warning',
        }).then(() => {
            delChannelGroup(id).then(res => {
                if (res?.state) {
                    CvMessage.success('操作成功');
                    initChannelList();
                    currentNode.value = null;
                }
            });
        });
    } else {
        CvMessageBox.confirm(t('fw.common.confirmDel'), t('fw.common.tips'), {
            type: 'warning',
        }).then(() => {
            delChannel(node.parent.data.id, id).then(res => {
                if (res?.state) {
                    CvMessage.success('操作成功');
                    initChannelList();
                    currentNode.value = null;
                }
            });
        });
    }
};

const handleUpdateGroups = async (values: any) => {
    const res = await createChannelGroup(values);
    if (res.state) {
        initChannelList();
        CvMessage.success('操作成功');
    } else CvMessage.error(res.data.msg);
};

const handleCreateChannel = async (form: any) => {
    const cid = currentNode.value.data.id;
    const res = await createChannel(cid, form);
    if (res.state) {
        CvMessage.success('操作成功');
        addChannelRef.value.close();
        initChannelList();
    } else {
        CvMessage.error(res.data.msg);
    }
};

const handleUpdateChannel = async (form: any) => {
    const pid = currentNode.value.parent.data.id;
    const cid = currentNode.value.data.id;
    const res = await updateChannel(pid, cid, form);
    if (res.state) {
        CvMessage.success('操作成功');
        initChannelList();
    } else {
        CvMessage.error(res.data.msg);
    }
};

const handleSubmitChannel = async (form: any) => {
    const cid = currentNode.value.data.id;
    const res = await updateChannelGroup(cid, form);
    if (res.state) {
        initChannelList();
        CvMessage.success('操作成功');
    } else CvMessage.error(res.data.msg);
};

const handleNodeClick = (data: any, node: any) => {
    currentNode.value = node;
};
</script>
<style scoped lang="scss">
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

.main-contain {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
}

.main-contain__center {
    padding: 16px;
    background: #fff;
    height: calc(100% - 48px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.bold-text {
    color: #35353e;
    font-weight: bold;
}

.custom-tree-node {
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-cont {
        width: 180px;
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

.w-cm {
    width: 220px;
}

.empty {
    background: #fff;
}
</style>
