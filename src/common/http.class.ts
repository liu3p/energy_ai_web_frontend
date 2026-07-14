import {Http, Response} from 'cloudview.ui-next';
import {TokenUtils} from './tools';
import authService from './auth.service';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

enum HttpMethod {
    get = 'get',
    post = 'post',
    put = 'put',
    patch = 'patch',
    delete = 'delete',
}
type CallbackType = (...args: any[]) => void;

let refreshing = false;
const callbackQueue: CallbackType[] = [];

// 将请求加入缓存队列
const pushQueue = (callback: CallbackType) => {
    callbackQueue.push(callback);
};

// 将缓存队列中的请求全部发送
const execQueue = (): void => {
    callbackQueue.forEach(callback => {
        callback();
    });
    callbackQueue.length = 0;
};

/*
 * 执行刷新token
 * 如果成功，则使用新token，将之前失败和未发送的请求重新发送
 * 如果失败，则将请求队列清空，并将url重定向到登录页
 * */
export const refreshToken = async (): Promise<void> => {
    try {
        const res = await authService.refreshToken();
        if (res.ok) {
            TokenUtils.setLocalToken(await res.json());
            execQueue();
        } else {
            TokenUtils.clearLocalToken();
            authService.redirectLogin();
        }
    } catch {
        TokenUtils.clearLocalToken();
        authService.redirectLogin();
    } finally {
        callbackQueue.length = 0;
        refreshing = false;
    }
};

/*
 * 封装的Service
 * 业务请求需要实例化此类
 * 异常处理请不要直接修改此类内部的responseHandle方法，而是在实例化时通过构造函数的option参数，设置responseHandle的钩子
 * */
export class Service {
    httpOption: Record<string, unknown>;
    httpInstance: Http | null;

    constructor(option = {}) {
        this.httpOption = option;
        this.httpInstance = null;
    }

    get http() {
        if (!this.httpInstance) {
            this.createInstance();
        }
        return this.httpInstance;
    }

    createInstance() {
        const settingRequestHandle = this.httpOption.requestHandle;
        const settingResponseHandle = this.httpOption.responseHandle;
        this.httpOption.requestHandle = (config: AxiosRequestConfig) => {
            const token = TokenUtils.getLocalToken();
            const tokenType = TokenUtils.getLocalTokenType();
            const refreshToken = TokenUtils.getLocalRefreshToken();
            config.headers!['X-Requested-With'] = 'XMLHttpRequest';
            config.headers!.Accept = 'application/json; text/html';
            // config.headers!['Content-Type'] = 'application/json; charset=UTF-8';

            if (refreshToken) {
                config.headers!.RefreshToken = refreshToken;
            }
            if (token) {
                config.headers!.Authorization = `${tokenType} ${token}`;
            }

            if (settingRequestHandle instanceof Function) {
                config = settingRequestHandle(config);
            }
            return config;
        };

        this.httpOption.responseHandle = (response: AxiosResponse, error: Error) => {
            if (!response && error) {
                throw error;
            }
            // todo: 如果业务有明确的错误码，请根据业务错误码决定是否刷新token
            if (response.status === 401) {
                if (!refreshing) {
                    refreshing = true;
                    refreshToken();
                }
            }

            // 执行外部的response处理函数
            if (settingResponseHandle instanceof Function) {
                response = settingResponseHandle(response);
            }
            return response;
        };
        this.httpInstance = new Http(this.httpOption);
    }

    createRequestPromise<T>(method: HttpMethod, url: string, ...args: any[]): Promise<Response<T>> {
        return new Promise(resolve => {
            pushQueue(() => {
                resolve(this.http![method](url, ...args));
            });
        });
    }

    async request<T>(method: HttpMethod, url: string, ...args: any[]): Promise<Response<T>> {
        if (!refreshing) {
            const res: Response<T> = await this.http![method](url, ...args);
            // todo: 如果业务有明确的错误码，请根据业务错误码决定是否刷新token
            if (res.status === 401) {
                return this.createRequestPromise(method, url, ...args);
            }
            return Promise.resolve(res);
        }
        return this.createRequestPromise(method, url, ...args);
    }

    get<T>(url: string, ...args: any[]) {
        return this.request<T>(HttpMethod.get, url, ...args);
    }

    post<T>(url: string, ...args: any[]) {
        return this.request<T>(HttpMethod.post, url, ...args);
    }

    put<T>(url: string, ...args: any[]) {
        return this.request<T>(HttpMethod.put, url, ...args);
    }

    patch<T>(url: string, ...args: any[]) {
        return this.request<T>(HttpMethod.patch, url, ...args);
    }

    async delete<T>(url: string, ...args: any[]): Promise<Response<T>> {
        if (args.length > 0) {
            const data = args[0];
            const config: AxiosRequestConfig = args[1] || {};
            config.data = data;
            config.headers = config.headers || {};
            const token = TokenUtils.getLocalToken();
            const tokenType = TokenUtils.getLocalTokenType();
            const refreshToken = TokenUtils.getLocalRefreshToken();
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
            config.headers['Accept'] = 'application/json; text/html';
            if (refreshToken) {
                config.headers['RefreshToken'] = refreshToken;
            }
            if (token) {
                config.headers['Authorization'] = `${tokenType} ${token}`;
            }
            const baseURL = this.httpOption.baseURL as string;
            const fullUrl = baseURL ? `${baseURL}${url}` : url;
            const response = await axios.delete<Response<T>>(fullUrl, config);
            return response.data;
        }
        return this.request<T>(HttpMethod.delete, url, ...args);
    }

    source() {
        return this.http?.source();
    }
}
