export interface LicenseInfo {
    is_valid?: boolean;
    is_expired?: boolean;
    remaining_days?: number;
    expire_date?: string;
    license_key?: string;
}

const LICENSE_VALID_KEY = 'licenseValid';

/** 许可证激活状态。sessionStorage 只做缓存，是否注册以 /license/status 为准。 */
export class License {
    static setFromLogin(license?: LicenseInfo | null) {
        if (typeof license?.is_valid !== 'boolean') {
            return;
        }
        this.setValid(license.is_valid);
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
