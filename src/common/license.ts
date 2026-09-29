export interface LicenseInfo {
    is_valid?: boolean;
    is_expired?: boolean;
    remaining_days?: number;
    expire_date?: string;
    license_key?: string;
}

const LICENSE_VALID_KEY = 'licenseValid';

/** 许可证激活状态（登录返回 license.is_valid） */
export class License {
    static setFromLogin(license?: LicenseInfo | null) {
        // 仅当明确返回 is_valid === false 时未激活；无字段时兼容旧接口视为已激活
        const valid = !(license && license.is_valid === false);
        sessionStorage.setItem(LICENSE_VALID_KEY, valid ? '1' : '0');
    }

    static setValid(valid: boolean) {
        sessionStorage.setItem(LICENSE_VALID_KEY, valid ? '1' : '0');
    }

    static get isValid(): boolean {
        return sessionStorage.getItem(LICENSE_VALID_KEY) === '1';
    }

    static clear() {
        sessionStorage.removeItem(LICENSE_VALID_KEY);
    }
}
