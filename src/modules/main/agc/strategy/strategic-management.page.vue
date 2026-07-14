<template>
    <div class="container">
        <div class="main-contain">
            <cv-scrollbar style="height: 100%">
                <div class="channel-header">
                    <span class="title">策略管理</span>
                    <cv-button @click="strategicRef.open(strategyList)" style="float: right;" type="primary">
                        <cv-icon :size="16" color="transparent" style="cursor: pointer">
                            <icon-submit></icon-submit>
                        </cv-icon>
                        <span>添加策略</span>
                    </cv-button>
                </div>
                <div class="table-container">
                    <div :class="{
                        card: true,
                        'card-active': item.active,
                        'card-inactive': !item.active,
                    }" v-for="item in strategyList" :key="item.name">
                        <div class="card-container">
                            {{ item.desc || item.name }}
                        </div>
                        <div :class="{
                            'card-footer': true,
                            'card-footer__active': item.active,
                            'card-footer__inactive': !item.active,
                        }">
                            <cv-switch v-if="!item.active" :model-value="!!item.active"
                                       @change="startStrategy(item)" />
                            <cv-switch v-else :model-value="!!item.active" @change="stopStrategy(item.name)" />
                            <div style="display: flex;align-items: center;">
                                <cv-icon size="24" class="operate-button" @click="strategicDrawerRef.open(item.name,!!item.active)">
                                    <cv-icon-setting />
                                </cv-icon>
                                <cv-icon v-if="!item.active"  size="24" class="operate-button" style="margin-left: 12px;"
                                         @click="delStrategic(item.name)">
                                    <cv-icon-delete />
                                </cv-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </cv-scrollbar>
        </div>
    </div>
    <strategic-management-dialog ref="strategicRef" @refresh="queryStrategys" />
    <strategic-management-drawer ref="strategicDrawerRef" />
</template>

<script setup lang="ts">
import {IconSubmit} from '@/icons';
import {CvMessageBox, useLocale} from 'cloudview.ui-next';
import StrategicManagementDialog from '@/modules/main/agc/strategy/strategic-management-dialog.vue';
import StrategicManagementDrawer from '@/modules/main/agc/strategy/strategic-management-drawer.vue';
import StrategicManagementService from '@/modules/main/agc/strategy/strategic-management.service';
import {h, onMounted, ref} from 'vue';

const strategicRef = ref();
const strategicDrawerRef = ref();
const strategyList = ref<{name: string, active: number, desc: string}[]>([]);
onMounted(() => {
    queryStrategys();
});
const queryStrategys = () => {
    StrategicManagementService.getStrategys().then(res => {
        if (res.state) {
            strategyList.value = res.data;
        }
    });
};
const startStrategy = ({name, desc}: {name: string, desc: string}) => {
    StrategicManagementService.queryConflict(name).then(res => {
        if (res.state) {
            if (res.data.length) {
                const data = res.data.map((item: {name: string, desc: string}) => item.desc).join(', ');
                CvMessageBox.confirm(
                    h('p', null, [
                        h('span', null, '该策略与已运行策略'),
                        h('span', {style: 'color: #e13131'}, ` ${data} `),
                        h('span', null, '互斥，是否确定切换到新策略 '),
                        h('span', {style: 'color: #e13131'}, `${desc} ?`),
                    ]),
                    '提示',
                ).then(() => {
                    Promise.all(res.data.map((item: {name: string}) => {
                        return new Promise(resolve => {
                            StrategicManagementService.stopStrategy(item.name).then(() => {
                                resolve(true);
                            });
                        });
                    })).then(() => {
                        StrategicManagementService.startStrategy(name).then(res => {
                            CvMessage.success('操作成功');
                            queryStrategys();
                        });
                    });
                });
            } else {
                CvMessageBox.confirm('确定投入当前策略？', '投入策略', {
                    type: 'warning',
                }).then(() => {
                    StrategicManagementService.startStrategy(name).then(res => {
                        if (res.state) {
                            CvMessage.success('操作成功');
                            queryStrategys();
                        } else CvMessage.error(res.data.msg);
                    });
                });
            }
        } else CvMessage.error(res.data.msg);
    });
};
const stopStrategy = (name: string) => {
    CvMessageBox.confirm('确定退出当前策略？', '退出策略', {
        type: 'warning',
    }).then(() => {
        StrategicManagementService.stopStrategy(name).then(res => {
            CvMessage.success('操作成功');
            queryStrategys();
        });
    });
};
const delStrategic = (name: string) => {
    CvMessageBox.confirm('确定删除当前策略？', '删除策略', {
        type: 'warning',
    }).then(() => {
        StrategicManagementService.removeStrategy(name).then(res => {
            CvMessage.success('操作成功');
            queryStrategys();
        });
    });
};

</script>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
}

.main-contain {
    position: relative;
    border-radius: 12px;
    width: 100%;
    height: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
}

.channel-header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EBEBEB;
    .title {
        font-weight: bold;
        line-height: 30px;
        font-size: 16px;
        color: #35353E;
    }
}

.table-container {
    width: 100%;
    border: none;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 20px;
    padding: 12px 20px;

    .card {
        background-repeat: no-repeat;
        background-size: cover;
        background-origin: border-box;
        width: 332px;
        height: 136px;
        border-radius: 8px;
        box-sizing: border-box;
        overflow: hidden;

        &-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 80px;
            font-size: 18px;
            font-weight: bold;
            color: #35353E;
        }

        &-footer {
            width: 100%;
            height: 56px;
            padding: 0 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        &-footer__active {
            background: #FFFFFF1A;
            border-top: 1px solid #FFFFFF5E;
        }

        &-footer__inactive {
            background: #f8f8f8;
            border-top: 1px solid #E2E2E2;
        }
    }

    .card-active {
        background-image: url("../../../../assets/images/on_bg.png");
        border: 2px solid #3162E1;

    }

    .card-inactive {
        background-image: url("../../../../assets/images/off_bg.png");
        border: 2px solid #D7D7D8;
    }
}

.operate-button {
    cursor: pointer;
    color: #35353E;
}
</style>