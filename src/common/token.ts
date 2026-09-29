import {TokenModel} from './token.model';
import {License} from './license';

export class Token {
    static _token: string | null = null;
    static _tokenType: string | null = null;
    static _refreshToken: string | null = null;

    static setLocalToken(data: TokenModel): void {
        Token._token = data.access_token;
        Token._tokenType = data.token_type;
        Token._refreshToken = data.refresh_token;

        sessionStorage.setItem('token', data.access_token || '');
        sessionStorage.setItem('refreshToken', data.refresh_token || '');
        sessionStorage.setItem('tokenType', data.token_type || '');
        License.setFromLogin(data.license);
    }

    static get token(): string | null {
        return Token._token || (Token._token = sessionStorage.getItem('token'));
    }

    static get tokenType(): string | null {
        return Token._tokenType || (Token._tokenType = sessionStorage.getItem('tokenType'));
    }

    static get refreshToken(): string | null {
        return Token._refreshToken || (Token._refreshToken = sessionStorage.getItem('refreshToken'));
    }

    static clearLocalToken(): void {
        Token._token = null;
        Token._tokenType = null;
        Token._refreshToken = null;

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('tokenType');
        License.clear();
    }
}
