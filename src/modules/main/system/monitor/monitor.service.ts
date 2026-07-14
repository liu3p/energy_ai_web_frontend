import {WebsocketClass} from '@/common/websocket/websocket.class';
import {refreshToken} from '@/common/http.class';
import {Token} from '@/common/token';
import {getConfig} from '@/common/config_util';

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
    baseUrl += `/log/system/ws/sysinfo`;
    return new WebsocketClass(baseUrl, refreshToken, () => {
        return {
            token: Token.token,
            tokenType: Token.tokenType,
        };
    });
};
export const initDeviceWebsocket = () => {
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
    baseUrl += `/log/datamonitor/channels/status`;
    return new WebsocketClass(baseUrl, refreshToken, () => {
        return {
            token: Token.token,
            tokenType: Token.tokenType,
        };
    });
};