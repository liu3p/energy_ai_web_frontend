import type {HttpConfig, Param, Response} from 'cloudview.ui-next';
import type {QoS} from 'mqtt';
import type {ICustomDefinition} from './binding.type';

export interface IHttp {
    get<T>(url: string, params?: Param, config?: HttpConfig): Promise<Response<T>>;

    post<T>(url: string, data: unknown, params?: Param, config?: HttpConfig): Promise<Response<T>>;

    put<T>(url: string, data: unknown, params?: Param, config?: HttpConfig): Promise<Response<T>>;

    patch<T>(url: string, data: unknown, params?: Param, config?: HttpConfig): Promise<Response<T>>;

    delete<T>(url: string, params?: Param, config?: HttpConfig): Promise<Response<T>>;
}

export interface IGlobalConfigType {
    http: IHttp | null;
    vnbId: string | null;
    camelToSnake: boolean;
    mqttUrl: string;
    mqttQos: QoS;
    topicPre: string;
    customBindings: ICustomDefinition;
    t: (key: string, ...args: unknown[]) => string;
}
