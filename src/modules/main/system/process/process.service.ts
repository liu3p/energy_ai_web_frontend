import {WebsocketClass} from '@/common/websocket/websocket.class';
import {refreshToken} from '@/common/http.class';
import {Token} from '@/common/token';
import {getConfig} from '@/common/config_util';
import {http} from '@/common/http';
import axios from 'axios';

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
    baseUrl += `/log/system/ws/process`;
    return new WebsocketClass(baseUrl, refreshToken, () => {
        return {
            token: Token.token,
            tokenType: Token.tokenType,
        };
    });
};

export const resetProcess = (
    id: string,
    data: {
        checkpwd: string;
        op: 'restart';
    }
) => {
    return http.post(`/log/system/process/${id}`, data);
};
export const resetReboot = (data: {checkpwd: string}) => {
    return http.post(`/log/system/reboot`, data);
};

export const getProcessLogList = (processName: string) => {
    return http.get(`/log/system/log_list/process/${processName}`);
};

export const downloadProcessLogs = (fileNames: string[]) => {
    const token = Token.token;
    const tokenType = Token.tokenType;
    return axios.post(`${getConfig('API_URL')}/log/system/download/log_file`, fileNames, {
        responseType: 'blob',
        headers: {
            Authorization: `${tokenType} ${token}`,
        },
    });
};
