import {TokenModel} from './token.model';

export const TokenUtils = {
    setLocalToken(data: TokenModel): void {
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('refreshToken', data.refresh_token);
        sessionStorage.setItem('tokenType', data.token_type);
    },
    getLocalToken(): string | null {
        return sessionStorage.getItem('token');
    },
    getLocalTokenType(): string | null {
        return sessionStorage.getItem('tokenType');
    },
    getLocalRefreshToken(): string | null {
        return sessionStorage.getItem('refreshToken');
    },
    clearLocalToken(): void {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('tokenType');
    },
};
