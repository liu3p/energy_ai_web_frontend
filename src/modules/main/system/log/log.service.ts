import {WebsocketClass} from '@/common/websocket/websocket.class';
import {refreshToken} from '@/common/http.class';
import {Token} from '@/common/token';
import {getConfig} from '@/common/config_util';

export let webSocket: WebsocketClass;
export const initWebsocket = (processId: string) => {
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
    baseUrl += `/log/system/process/${processId}/logdump`;
    return new WebsocketClass(baseUrl, refreshToken, () => {
        return {
            token: Token.token,
            tokenType: Token.tokenType,
        };
    });
};
