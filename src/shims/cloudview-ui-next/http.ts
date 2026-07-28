import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type CancelTokenSource} from 'axios';

export interface Response<T = unknown> {
    status: number;
    data: T;
    code?: number;
    state?: boolean;
    msg?: string;
}

export class Http {
    private instance: AxiosInstance;
    private option: Record<string, unknown>;

    constructor(option: Record<string, unknown> = {}) {
        this.option = option;
        this.instance = axios.create({
            baseURL: option.baseURL as string,
            timeout: (option.timeout as number) || 30000,
        });

        this.instance.interceptors.request.use(config => {
            const requestHandle = this.option.requestHandle as
                | ((config: AxiosRequestConfig) => AxiosRequestConfig)
                | undefined;
            return requestHandle ? requestHandle(config) : config;
        });

        this.instance.interceptors.response.use(
            response => {
                const responseHandle = this.option.responseHandle as
                    | ((response: AxiosResponse, error: Error | null) => AxiosResponse)
                    | undefined;
                return responseHandle ? responseHandle(response, null as unknown as Error) : response;
            },
            error => {
                const responseHandle = this.option.responseHandle as
                    | ((response: AxiosResponse, error: Error) => AxiosResponse)
                    | undefined;
                if (responseHandle && error.response) {
                    return responseHandle(error.response, error);
                }
                return Promise.reject(error);
            }
        );
    }

    private normalizeResponse<T>(data: unknown, status: number): Response<T> {
        if (data && typeof data === 'object' && 'state' in data) {
            return {
                ...(data as Response<T>),
                status: (data as Response<T>).status ?? status,
            };
        }
        return {
            state: status >= 200 && status < 300,
            data: data as T,
            status,
        };
    }

    private async request<T>(method: string, url: string, ...args: unknown[]): Promise<Response<T>> {
        const response = await (this.instance as Record<string, (...params: unknown[]) => Promise<AxiosResponse>>)[
            method
        ](url, ...args);
        return this.normalizeResponse<T>(response.data, response.status);
    }

    get<T>(url: string, config?: AxiosRequestConfig) {
        return this.request<T>('get', url, config);
    }

    post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        return this.request<T>('post', url, data, config);
    }

    put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        return this.request<T>('put', url, data, config);
    }

    patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        return this.request<T>('patch', url, data, config);
    }

    delete<T>(url: string, config?: AxiosRequestConfig) {
        return this.request<T>('delete', url, config);
    }

    source(): CancelTokenSource {
        return axios.CancelToken.source();
    }
}
