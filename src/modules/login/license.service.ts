import {http} from '@/common/http';
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

    /** 查询许可证状态 */
    static async getStatus(): Promise<Response<LicenseInfo | {data?: LicenseInfo}>> {
        return http.get(`log/license/status`);
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
