import axios from 'axios';
import {http} from '@/common/http';
import {getConfig} from '@/common/config_util';
import {Token} from '@/common/token';
import {License} from '@/common/license';
import type {Response} from 'cloudview.ui-next';
import type {LicenseInfo} from '@/common/license';

function pickSerialNumber(payload: unknown): string {
    if (typeof payload === 'string') {
        return payload;
    }
    if (!payload || typeof payload !== 'object') {
        return '';
    }
    const data = payload as Record<string, unknown>;
    // 接口实际返回：{ "serial_number": "FD8B-1C2A-2F80-336F" }
    if (typeof data.serial_number === 'string' && data.serial_number) {
        return data.serial_number;
    }
    if (data.data && typeof data.data === 'object') {
        return pickSerialNumber(data.data);
    }
    return '';
}

export default class LicenseServiceApi {
    /** 查询机器码/序列号 */
    static async getMachineSerial(): Promise<Response<any>> {
        return http.get(`log/license/machine_serial`);
    }

    /** 获取序列号 serial_number */
    static async fetchSerialNumber(): Promise<string> {
        const res = await this.getMachineSerial();
        if (!res.state) {
            return '';
        }
        return pickSerialNumber(res.data);
    }

    /** 提交外部提供的注册码激活 */
    static async register(licenseKey: string): Promise<Response<any>> {
        return http.post(`log/license/register`, {license_key: licenseKey});
    }

    /** 查询许可证状态。401 抛出，避免被通用请求层当成刷新 token 后挂起。 */
    static async getStatus(): Promise<Response<LicenseInfo | {data?: LicenseInfo}>> {
        const headers: Record<string, string> = {Accept: 'application/json'};
        if (Token.token) {
            headers.Authorization = `${Token.tokenType || ''} ${Token.token}`.trim();
        }
        const response = await axios.get(`${getConfig('API_URL')}/log/license/status`, {
            headers,
            timeout: 30000,
            validateStatus: () => true,
        });
        if (response.status === 401) {
            const error = new Error('unauthorized') as Error & {response?: {status: number}};
            error.response = {status: 401};
            throw error;
        }
        return {
            status: response.status,
            data: response.data,
            state: response.status >= 200 && response.status < 300,
        };
    }

    static pickLicenseInfo(payload: unknown): LicenseInfo | null {
        if (!payload || typeof payload !== 'object') {
            return null;
        }
        const data = payload as Record<string, unknown>;
        if (typeof data.is_valid === 'boolean') {
            return data as LicenseInfo;
        }
        if (data.data && typeof data.data === 'object') {
            return this.pickLicenseInfo(data.data);
        }
        if (data.license && typeof data.license === 'object') {
            return this.pickLicenseInfo(data.license);
        }
        return null;
    }
}

/** 以 /license/status 刷新缓存。只有明确的 is_valid 才会写入。 */
export async function refreshLicenseStatus(): Promise<boolean> {
    const resp = await LicenseServiceApi.getStatus();
    const info = LicenseServiceApi.pickLicenseInfo(resp.data);
    if (!info || typeof info.is_valid !== 'boolean') {
        throw new Error('invalid license response');
    }
    const valid = info.is_valid === true;
    License.setValid(valid);
    return valid;
}
