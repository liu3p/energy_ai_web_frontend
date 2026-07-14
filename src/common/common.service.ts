import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';
import {UserInfoModel} from './user.model';

export function getMenus(projectId?: string): Promise<Response<any>> {
    return http.get('/menu/role-menus/self', {
        queryParam: {
            project_id: projectId,
        },
    });
}
export function getUserInfo(): Promise<Response<UserInfoModel>> {
    return http.get('/log/user/info');
}
