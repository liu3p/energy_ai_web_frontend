import {ref} from 'vue';
import {UserInfoModel} from './user.model';
import {getUserInfo} from './common.service';
import {Token} from './token';
import {RouteRecordRaw} from 'vue-router';
import {initWebsocket,webSocket} from '@/common/websocket/websocket';

export const userInfo = ref<UserInfoModel | null>();

export function initUserInfo() {
    if (userInfo.value) {
        return;
    }
    if (!userInfo.value && Token.token) {
        return getUserInfo().then(res => {
            if (res.state) {
                userInfo.value = res.data;
                // 使用用户ID初始化实时连接
                initWebsocket();
                webSocket.connect();
            }
        });
    }
}

export const userMenuList = ref<RouteRecordRaw[]>([]);

export function clearUserInfo() {
    userInfo.value = undefined;
    userMenuList.value = [];
    webSocket?.close();
}
