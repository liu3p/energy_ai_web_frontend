import {useGlobalConfig} from '../functions';
import type {Response} from 'cloudview.ui-next';
import type {
    IDevice,
    IDeviceProperty,
    IPaginationData,
    ITeleajust,
    ITeleajustHistory,
    ITelecontrol,
    ITelecontrolHistory,
    ITeleIndication,
    ITelemetry,
    ITelePulse,
} from '../types';

const http = useGlobalConfig('http');
const vnbId = useGlobalConfig('vnbId');

export class DeviceApi {
    static getTeleadjusts(id): Promise<Response<any>> {
        return http.value!.get<ITeleajust[]>('/dev/ra/slim/:id', {
            routerParam: {
                id,
            },
        });
    }

    static getTelecontrols(id) {
        return http.value!.get<ITelecontrol[]>('/dev/rc/slim/:id', {
            routerParam: {
                id,
            },
        });
    }

    static getTelemetries(id): Promise<Response<ITelemetry[]>> {
        return http.value!.get('/dev/tm/slim/:id', {
            routerParam: {
                id,
            },
        });
    }

    static getTeleindications(id): Promise<Response<ITeleIndication[]>> {
        return http.value!.get('/dev/ts/slim/:id', {
            routerParam: {
                id,
            },
        });
    }

    static getTelepulses(id): Promise<Response<ITelePulse[]>> {
        return http.value!.get('/dev/tp/slim/:id', {
            routerParam: {
                id,
            },
        });
    }

    static getDeviceProperties(id): Promise<Response<IDeviceProperty[]>> {
        return http.value!.get('/dev/property/slim/:id', {
            routerParam: {
                id,
            },
        });
    }

    static getDevice(id): Promise<Response<IDevice>> {
        return http.value!.get('/dev/:id', {
            routerParam: {
                id,
            },
        });
    }

    static getDeviceList(queryParam?: {
        treeId: string;
        keywords: string;
        page: number;
        pageSize: number;
    }): Promise<Response<IPaginationData<IDevice[]>>> {
        return http.value!.get('/tree/devices', {queryParam: {vnbId: vnbId.value, ...(queryParam ?? {})}});
    }

    static getTelemetryValue(
        deviceTopicList: Record<string, string[]>
    ): Promise<Response<Record<string, Record<string, unknown>>>> {
        return http.value!.post('/dev/tm/lv', deviceTopicList);
    }

    static getTeleindicationValue(
        deviceTopicList: Record<string, string[]>
    ): Promise<Response<Record<string, Record<string, unknown>>>> {
        return http.value!.post('/dev/ts/lv', deviceTopicList);
    }

    static getTelepulseValue(
        deviceTopicList: Record<string, string[]>
    ): Promise<Response<Record<string, Record<string, unknown>>>> {
        return http.value!.post('/dev/tp/lv', deviceTopicList);
    }

    static getDevicePropertyValue(
        deviceTopicList: Record<string, string[]>
    ): Promise<Response<Record<string, Record<string, unknown>>>> {
        return http.value!.post('/dev/property/lv', deviceTopicList);
    }

    static getDeviceStateValue(deviceSns: string[]): Promise<Response<Record<string, boolean>>> {
        return http.value!.post('/dev/lv/states', deviceSns);
    }

    static getTelecontrolHistory(
        id: string,
        page: number,
        pageSize: number,
        identifier?: string,
        createBeginTime?: string,
        createEndTime?: string
    ) {
        return http.value!.get<ITelecontrolHistory[]>('/dev/rc/hist/:id', {
            routerParam: {
                id,
            },
            queryParam: {
                identifier,
                createBeginTime,
                createEndTime,
                page,
                pageSize,
            },
        });
    }

    static emitTelecontrol(id: string, data: Record<string, any>) {
        return http.value!.post<{id: string}>('/dev/rc/async/:id', data, {
            routerParam: {id},
        });
    }

    static emitTeleajust(id: string, data: Record<string, any>) {
        return http.value!.post('/dev/ra/async/:id', data, {
            routerParam: {id},
        });
    }

    static getTeleajustHistory(
        id: string,
        page: number,
        pageSize: number,
        identifier?: string,
        createBeginTime?: string,
        createEndTime?: string
    ) {
        return http.value!.get<ITeleajustHistory[]>('/dev/ra/hist/:id', {
            routerParam: {
                id,
            },
            queryParam: {
                identifier,
                createBeginTime,
                createEndTime,
                page,
                pageSize,
            },
        });
    }
}
