import {sha256} from 'js-sha256';
import {getConfig} from '@/common/config_util';
import {hmac} from './sha1';
import {Locale} from '@/common/locale';

const SIGNATURE_KEY = 'aae4Cu4dN9xhszr+2plcfud55Q+RhH1+VN5qSwFN806fb828-1152-4887-a6e7-a50248c0fb8e';

class CommApi {
    private static base64_encode(str: string): string {
        let c1, c2, c3;
        const base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let i = 0,
            string = '';
        const len = str.length;
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i === len) {
                string += base64EncodeChars.charAt(c1 >> 2);
                string += base64EncodeChars.charAt((c1 & 0x3) << 4);
                string += '==';
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i === len) {
                string += base64EncodeChars.charAt(c1 >> 2);
                string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
                string += base64EncodeChars.charAt((c2 & 0xf) << 2);
                string += '=';
                break;
            }
            c3 = str.charCodeAt(i++);
            string += base64EncodeChars.charAt(c1 >> 2);
            string += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
            string += base64EncodeChars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
            string += base64EncodeChars.charAt(c3 & 0x3f);
        }
        return string;
    }

    static setHeaders(url: string) {
        const ts = Date.now();
        return {
            ['X-Language-Type']: Locale.localeName.split('-')[0],
            Signature: this.base64_encode(sha256.hmac(SIGNATURE_KEY, `${url}${ts}`)),
            Timestamp: ts.toString(),
        };
    }

    // 生成APP扫码登录二维码
    static async qrCode(size: number, expire: number): Promise<{id: string; code: string}> {
        return await (
            await fetch(`${getConfig('API_URL')}comm/qrcode?size=${size}&expire=${expire}`, {
                headers: this.setHeaders('/comm/qrcode'),
                method: 'GET',
            })
        ).json();
    }

    // 根据ID获取扫码登录二维码状态
    static async getCodeStatus(id: string): Promise<{
        state: number;
        token: {
            access_token: string;
            expiry: string;
            refresh_token: string;
            token_type: string;
        };
    }> {
        return await (
            await fetch(`${getConfig('API_URL')}comm/qrcode/${id}`, {
                headers: this.setHeaders(`/comm/qrcode/${id}`),
                method: 'GET',
            })
        ).json();
    }

    // 根据手机号码验证是否为系统注册的手机号码
    static async validatePhone(mobile: string) {
        return fetch(`${getConfig('API_URL')}comm/mobile/${mobile}`, {
            headers: this.setHeaders(`/comm/mobile/${mobile}`),
            method: 'GET',
        });
    }

    // 根据邮箱验证是否为系统注册的邮箱号
    static async validateEmail(email: string) {
        return fetch(`${getConfig('API_URL')}comm/email/${email}`, {
            headers: this.setHeaders(`/comm/email/${email}`),
            method: 'GET',
        });
    }

    // 发送手机短信
    static async smsCode(mobile: string, expire: number) {
        return fetch(`${getConfig('API_URL')}comm/sms`, {
            headers: this.setHeaders(`/comm/sms`),
            method: 'POST',
            body: JSON.stringify({mobile, expire}),
        });
    }

    // 发送邮箱验证码
    static async smsEmailCode(to_addr: string, expire: number) {
        return fetch(`${getConfig('API_URL')}comm/email`, {
            headers: this.setHeaders(`/comm/email`),
            method: 'POST',
            body: JSON.stringify({to_addr, expire}),
        });
    }

    // 根据手机短信验证码验证是否有效
    static async validateCode(code: string, mobile: string) {
        return fetch(`${getConfig('API_URL')}comm/sms/verify`, {
            headers: this.setHeaders(`/comm/sms/verify`),
            method: 'POST',
            body: JSON.stringify({code, mobile}),
        });
    }

    // 根据邮箱验证码验证是否有效
    static async validateEmailCode(code: string, email: string) {
        return fetch(`${getConfig('API_URL')}comm/email/verify`, {
            headers: this.setHeaders(`/comm/email/verify`),
            method: 'POST',
            body: JSON.stringify({code, email}),
        });
    }

    // 根据手机号和验证码重置用户密码
    static async resetPwd(key: string, mobile: string, password: string) {
        return fetch(`${getConfig('API_URL')}comm/user/reset`, {
            headers: this.setHeaders(`/comm/user/reset`),
            method: 'PATCH',
            body: JSON.stringify({key, mobile, password: hmac(password)}),
        });
    }

    // 根据手机号和验证码重置用户密码
    static async resetPwdEmail(key: string, email: string, password: string) {
        return fetch(`${getConfig('API_URL')}comm/user/reset/email`, {
            headers: this.setHeaders(`/comm/user/reset/email`),
            method: 'PATCH',
            body: JSON.stringify({key, email, password: hmac(password)}),
        });
    }

    // 获取定制化信息
    static async getCustomInfo(domain: string): Promise<DomainCustomInfoModel> {
        return (
            await fetch(`${getConfig('API_URL')}comm/domain/${domain}`, {
                headers: this.setHeaders(`/comm/domain/${domain}`),
                method: 'GET',
            })
        ).json();
    }

    // 获取时区
    static async getZone(): Promise<{now: string; offset: number; offshore_version: boolean; zone: string}> {
        return (
            await fetch(`${getConfig('API_URL')}comm/zone`, {
                headers: this.setHeaders(`/comm/zone`),
                method: 'GET',
            })
        ).json();
    }
    // 获取所有地区和地区码
    static async getMobileGlobalCode() {
        return (
            await fetch(`${getConfig('API_URL')}comm/global_code`, {
                headers: this.setHeaders(`/comm/global_code`),
                method: 'GET',
            })
        ).json();
    }
}

export default CommApi;

export interface DomainCustomInfoModel {
    domain: string;
    sys_name_zh: string;
    sys_name_en: string;
    icon: string;
    logo: string;
    extend: {ios?: string; android?: string; recordNumber: string; document_center?: string; overviewImg?: string};
}
