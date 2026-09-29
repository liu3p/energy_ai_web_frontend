import type {LicenseInfo} from './license';

export interface TokenModel {
    access_token: string;
    token_type: string;
    refresh_token: string;
    expiry?: string;
    license?: LicenseInfo;
}
