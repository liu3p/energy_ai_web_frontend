<template>
    <div class="account-management">
        <div class="box">
            <cv-table border :data="tableData" height="string" style="flex: 1">
                <cv-table-column
                    :label="t('fw.common.number')"
                    type="index"
                    width="70"
                    align="center"
                ></cv-table-column>
                <cv-table-column :label="t('fw.login.username')" prop="username" align="center"></cv-table-column>
                <cv-table-column :label="t('fw.login.lastLoginTime')" prop="lastlogin" align="center"></cv-table-column>
                <cv-table-column :label="t('fw.login.status')" prop="status" align="center">
                    <template #default="{row}">
                        <cv-tag v-if="row.status === 1" type="success">{{ t('fw.login.online') }}</cv-tag>
                        <cv-tag v-else type="danger">{{ t('fw.login.offline') }}</cv-tag>
                    </template>
                </cv-table-column>
                <cv-table-column :label="t('fw.common.operation')" width="88" align="center">
                    <template #default="{row}">
                        <div class="operate">
                            <cv-tooltip v-if="row.status === 1" effect="dark" :content="t('fw.login.kickout')">
                                <cv-icon
                                    size="20"
                                    style="cursor: pointer"
                                    color="transparent"
                                    @click="kickout(row.username)"
                                >
                                    <icon-kickout></icon-kickout>
                                </cv-icon>
                            </cv-tooltip>
                            <cv-tooltip effect="dark" :content="t('fw.login.resetPassword')">
                                <cv-icon
                                    size="20"
                                    color="transparent"
                                    style="cursor: pointer"
                                    @click="resetPassword(row.username)"
                                >
                                    <icon-resetpwd></icon-resetpwd>
                                </cv-icon>
                            </cv-tooltip>
                        </div>
                    </template>
                </cv-table-column>
            </cv-table>
        </div>
    </div>
</template>
<script setup lang="ts">
import {useLocale} from 'cloudview.ui-next';
import AccountManageApi from './account-manage.service';
import {h, ref} from 'vue';
import {AccountModel} from './accout-manage.model';
import {IconKickout, IconResetpwd} from '@/icons/index';

const {t} = useLocale();
const tableData = ref<AccountModel[]>([]);
const getLogUserAll = () => {
    AccountManageApi.getLogUserAll().then(res => {
        if (res.state) {
            tableData.value = res.data;
        }
    });
};
getLogUserAll();
const kickout = (username: string) => {
    CvMessageBox.confirm('', t('fw.login.kickout'), {
        confirmButtonText: t('fw.common.confirm'),
        cancelButtonText: t('fw.common.cancel'),
        message: h('div', {style: 'text-align: center'}, t('fw.login.confirmKickout')),
    }).then(() => {
        AccountManageApi.kickout(username)
            .then(res => {
                if (res.state) {
                    CvMessage.success(t('fw.common.operateSuccessful'));
                } else {
                    CvMessage.error(t('fw.common.operateFailed'));
                }
            })
            .finally(() => {
                getLogUserAll();
            });
    });
};
const resetPassword = (username: string) => {
    CvMessageBox.confirm('', t('fw.login.resetPassword'), {
        confirmButtonText: t('fw.common.confirm'),
        cancelButtonText: t('fw.common.cancel'),
        message: h('div', {style: 'text-align: center'}, t('fw.login.confirmResetPassword')),
    }).then(() => {
        AccountManageApi.resetPassword(username).then(res => {
            if (res.state) {
                CvMessage.success(t('fw.common.operateSuccessful'));
            } else {
                CvMessage.error(t('fw.common.operateFailed'));
            }
        });
    });
};
</script>
<style scoped lang="scss">
.account-management {
    height: 100%;
    margin-top: 16px;
    display: flex;
    flex-direction: column;
}

.title {
    color: #35353e;
    font-size: 16px;
    font-weight: 700;
    line-height: 34px;
}

.box {
    border-radius: 12px;
    flex: 1;
    width: 100%;
    background: #fff;
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.operate {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
}
</style>
