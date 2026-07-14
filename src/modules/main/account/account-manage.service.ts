import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';
import {AccountModel} from './accout-manage.model';

export default class AccountManageApi {
    static getLogUserAll(): Promise<Response<AccountModel[]>> {
        return http.get(`/log/user/all`);
    }

    static kickout(username: string) {
        return http.post(`/log/user/kickout`, {username: username});
    }

    static resetPassword(username: string) {
        return http.post(`/log/user/resetpwd`, {username: username});
    }
}
