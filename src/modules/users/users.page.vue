<template>
    <main-header></main-header>

    <div class="main-body flex-colum">
        <main-tool>
            <cv-input :placeholder="t('fw.users.pleaseInputUserName')"></cv-input>
            <template #end>
                <cv-button type="primary" @click="usersOperation?.open()">{{ t('fw.users.addUser') }}</cv-button>
            </template>
        </main-tool>

        <cv-pagination-table ref="table" :load-data="loadData" class="flex-grow" height="100%">
            <cv-table-column prop="name" :label="t('fw.users.name')" />
            <cv-table-column prop="date" :label="t('fw.users.date')" />
            <cv-table-column prop="address" :label="t('fw.users.address')" width="200px" />
            <cv-table-column :label="t('fw.common.operation')" align="right">
                <template #default="{row}">
                    <cv-button link @click="usersOperation?.open(row)">{{ t('fw.common.edit') }}</cv-button>
                    <cv-pop-confirm :title="t('fw.common.deleteConfirm')" @confirm="deleteUser(row)">
                        <template #reference>
                            <cv-button link>{{ t('fw.common.delete') }}</cv-button>
                        </template>
                    </cv-pop-confirm>
                </template>
            </cv-table-column>
        </cv-pagination-table>
    </div>

    <users-operation ref="usersOperation" @saved="onSaved"></users-operation>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import type {UserModel} from './user.model';
import MainHeader from '../../common/main-header.vue';
import MainTool from '../../common/main-tool.vue';
import UsersOperation from './users-operation.vue';

const {t} = useLocale();
const table = ref();
const usersOperation = ref();

// todo 模拟数据
const simulatedData: UserModel[] = [
    {
        date: '2016-05-03',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-02',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-04',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        date: '2016-05-01',
        name: 'Tom',
        address: 'No. 189, Grove St, Los Angeles',
    },
];

async function loadData({currentPage, pageSize}: {currentPage: number; pageSize: number}) {
    // todo 模拟网络请求
    return await new Promise(resolve => {
        setTimeout(() => {
            resolve({
                data: simulatedData.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize),
                total: simulatedData.length,
            });
        }, 1000);
    });
}

const onSaved = (data: UserModel) => {
    simulatedData.unshift(data);
    table.value.reloadData(true);
};

const deleteUser = (data: UserModel) => {
    // todo 删除逻辑
    console.log('删除', data);

    CvMessage({
        message: t('fw.common.deleteSuccess'),
        type: 'success',
    });
    table.value.reloadData();
};
</script>
