import {WebsocketClass} from '@/common/websocket/websocket.class';
import {refreshToken} from '@/common/http.class';
import {Token} from '@/common/token';
import {getConfig} from '@/common/config_util';
import type {Response} from 'cloudview.ui-next';
import {http} from '@/common/http';

export let webSocket: WebsocketClass;
export const initWebsocket = (rid: string, did: string, ptype: string) => {
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
    baseUrl += `/log/datamonitor/rtu/${rid}/device/${did}/points/${ptype}`;
    return new WebsocketClass(baseUrl, refreshToken, () => {
        return {
            token: Token.token,
            tokenType: Token.tokenType,
        };
    });
};
export const initChannelStatusWebsocket = (cgid: string, cid: string) => {
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
    baseUrl += `/log/datamonitor/cgroup/${cgid}/channel/${cid}/status`;
    return new WebsocketClass(baseUrl, refreshToken, () => {
        return {
            token: Token.token,
            tokenType: Token.tokenType,
        };
    });
};

export const initChannelReportWebsocket = (cgid: string, cid: string, pluginid: string) => {
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
    baseUrl += `/log/datamonitor/cgroup/${cgid}/channel/${cid}/plugin/${pluginid}/logs`;
    return new WebsocketClass(baseUrl, refreshToken, () => {
        return {
            token: Token.token,
            tokenType: Token.tokenType,
        };
    });
};

export const getChannelByRtu = (rid: string): Promise<Response<any>> => {
    return http.get(`/log/datamonitor/rtu/${rid}/channels`);
};

export const monitorControl = (rid: string, did: string, pid: string, data: any): Promise<Response<any>> => {
    return http.post(`/log/datamonitor/rtu/${rid}/device/${did}/point/${pid}/control`, data);
};

export const monitorRegulate = (rid: string, did: string, pid: string, data: any): Promise<Response<any>> => {
    return http.post(`/log/datamonitor/rtu/${rid}/device/${did}/point/${pid}/regulate`, data);
};