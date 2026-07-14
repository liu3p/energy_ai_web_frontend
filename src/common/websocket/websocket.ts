import {WebsocketClass} from './websocket.class';
import {refreshToken} from '../http.class';
import {Token} from '../token';
import {getConfig} from '../config_util';

export let webSocket: WebsocketClass;
export const initWebsocket = () => {
    let baseUrl = '';
    if (!/^ws.*/.test(getConfig('SOCKET_API_URL'))) {
        if (location.protocol === 'http:') {
            baseUrl = `ws://${location.host}${getConfig('SOCKET_API_URL')}`;
        } else {
            baseUrl = `
            wss://${location.host}${getConfig('SOCKET_API_URL')}`;
        }
    } else {
        baseUrl = `${getConfig('SOCKET_API_URL')}`;
    }
    webSocket = new WebsocketClass(baseUrl + '/log/ws/push', refreshToken, () => {
        return {
            token: Token.token,
            tokenType: Token.tokenType,
        };
    });
};
