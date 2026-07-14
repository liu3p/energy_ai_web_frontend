import {TokenUtils} from './tools';
import {hmac} from './sha1';
import {getConfig} from './config_util';
import {http} from '@/common/http';
import {clearUserInfo} from '@/common/user';
import {Token} from '@/common/token';

export default {
    // todo: 具体登录的url需要业务重新修改
    redirectLogin(): void {
        location.href = location.origin + '/login';
    },

    // todo: 修改刷新token的url, 返回失败的处理
    async refreshToken() {
        return await fetch(`${getConfig('API_URL')}/user/refresh_token`, {
            method: 'POST',
            body: JSON.stringify({
                refresh_token: Token.refreshToken,
            }),
        });
    },

    async login(username: string, password: string) {
        return fetch(`${getConfig('API_URL')}/user/login`, {
            method: 'POST',
            body: JSON.stringify({username, password}),
        });
    },

    async logout() {
        return http.post('/log/user/logout').then(res => {
            if (res.state) {
                clearUserInfo();
                Token.clearLocalToken();
            }
        });
    },
};
