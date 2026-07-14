import {getConfig} from '@/common/config_util';
import {http} from '@/common/http';
import {Token} from '@/common/token';
import type {Response} from 'cloudview.ui-next';

export function updateRun() {
    return fetch(`${getConfig('API_URL')}/log/update/run`, {
        method: 'POST',
        headers: {
            Authorization: `${Token.tokenType} ${Token.token}`,
        },
    });
}

export function uploadPkg(file: File, onProgress?: (e: ProgressEvent) => void): Promise<Response<any>> {
    const formData = new FormData();
    formData.set('file', file);
    return http.post('/log/update/uploadpkg', formData, null, {
        onUploadProgress: onProgress,
    });
}
export function getSystemInfo(): Promise<Response<any>> {
    return http.get(`/log/system/baseinfo`);
}

export function updateSystemInfo(data: any): Promise<Response<any>> {
    return http.post(`/log/system/baseinfo`,data);
}