import type {IHttp} from '../types';
import type {HttpConfig, Param, Response} from 'cloudview.ui-next';
import {Utils} from '../tools';

type QueryParam = Record<string, string | number | boolean | undefined | null>;

export class ExtendedHttp implements IHttp {
    private http: IHttp;
    private camelToSnake = false;

    constructor(http: IHttp, camelToSnake = false) {
        this.http = http;
        this.camelToSnake = camelToSnake;
    }

    private camel2Snake<T>(obj: T): T {
        if (this.camelToSnake) {
            const res = {};
            for (const key in obj) {
                res[Utils.camelToSnakeCase(key)] = obj[key];
            }
            return res as T;
        }
        return obj;
    }

    delete<T>(url: string, params?: Param, config?: HttpConfig): Promise<Response<T>> {
        if (params && params.queryParam) {
            params.queryParam = this.camel2Snake<QueryParam>(params?.queryParam);
        }
        return this.http.delete(url, params, config);
    }

    get<T>(url: string, params?: Param, config?: HttpConfig): Promise<Response<T>> {
        if (params && params.queryParam) {
            params.queryParam = this.camel2Snake<QueryParam>(params?.queryParam);
        }
        return this.http.get(url, params, config);
    }

    patch<T>(url: string, data: unknown, params?: Param, config?: HttpConfig): Promise<Response<T>> {
        if (params && params.queryParam) {
            params.queryParam = this.camel2Snake<QueryParam>(params?.queryParam);
        }
        return this.http.patch(url, data, params, config);
    }

    post<T>(url: string, data: unknown, params?: Param, config?: HttpConfig): Promise<Response<T>> {
        if (params && params.queryParam) {
            params.queryParam = this.camel2Snake<QueryParam>(params?.queryParam);
        }
        return this.http.post(url, data, params, config);
    }

    put<T>(url: string, data: unknown, params?: Param, config?: HttpConfig): Promise<Response<T>> {
        if (params && params.queryParam) {
            params.queryParam = this.camel2Snake<QueryParam>(params?.queryParam);
        }
        return this.http.put(url, data, params, config);
    }
}
