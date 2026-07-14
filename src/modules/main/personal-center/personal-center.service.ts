import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';
import type {UpdateUserModel, UserModel} from './personal-center.model';
import {hmac} from '@/common/sha1';

export default class PersonalCenterAPI {
    static getUserInfo(): Promise<Response<UserModel>> {
        return http.get('/user');
    }
    static updateUserInfo(id: string, data: UpdateUserModel) {
        return http.put('/user/:id', data, {routerParam: {id}});
    }
    static updateName(id: string, email: string, nick_name: string) {
        return http.put('/user/:id/name', {'email': email, 'nick_name': nick_name}, {routerParam: {id}});
    }
    static updateMobile(id: string, mobile: string, area_code: string) {
        return http.put('/user/:id/mobile', {'mobile': mobile, 'area_code': area_code}, {routerParam: {id}});
    }

    static updateEmail(id: string, email: string) {
        return http.put('/user/:id/email', {'email': email}, {routerParam: {id}});
    }

    static checkOrgPwd(id: string, pwd: string) {
        return http.post('/user/:id/pwd', {password: hmac(pwd)}, {routerParam: {id}});
    }
}
