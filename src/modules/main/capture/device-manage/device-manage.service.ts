import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';
import {translate} from '@/shims/cloudview-ui-next/locale-store';
import type {DeviceTreeNode, DispatchMode, ParamCardItem, StationNode} from './device-manage.types';
import {extractStationPayload, normalizeStationPayload, parseMonitorPointRef, parseStationModel} from './station-model.util';

interface AgcDataResponse {
    station_model?: StationNode | {data: StationNode; method?: string; model?: string};
    strategy_model?: unknown;
}

interface DispatchPayload {
    value: string | number;
    checkpwd: string;
}

function buildStationTree(root: StationNode): DeviceTreeNode {
    return parseStationModel(normalizeStationPayload(root));
}

export async function fetchStationModel(): Promise<DeviceTreeNode | null> {
    try {
        const res = await http.get<AgcDataResponse | StationNode | {data: StationNode}>('/log/agc/station_model');
        if (!res.state || !res.data) {
            return null;
        }

        const payload = res.data as AgcDataResponse;
        const root = payload.station_model
            ? extractStationPayload(payload.station_model)
            : extractStationPayload(res.data);
        if (root) {
            return buildStationTree(root);
        }
    } catch (error) {
        console.warn('[device-manage] fetch station model failed', error);
    }

    return null;
}

export function monitorControl(rid: string, did: string, pid: string, data: DispatchPayload): Promise<Response<any>> {
    return http.post(`/log/datamonitor/rtu/${rid}/device/${did}/point/${pid}/control`, data);
}

export function monitorRegulate(rid: string, did: string, pid: string, data: DispatchPayload): Promise<Response<any>> {
    return http.post(`/log/datamonitor/rtu/${rid}/device/${did}/point/${pid}/regulate`, data);
}

export async function dispatchDeviceParam(
    param: ParamCardItem,
    value: string | number,
    checkpwd: string,
): Promise<{state: boolean; message?: string}> {
    if (!param.database_id) {
        return {state: false, message: translate('fw.deviceManage.error.noDatabaseId')};
    }

    const pointRef = parseMonitorPointRef(param.database_id);
    if (!pointRef) {
        return {state: false, message: translate('fw.deviceManage.error.invalidPointId')};
    }

    const payload: DispatchPayload = {value, checkpwd};
    const dispatchMode: DispatchMode = param.dispatchMode ?? (param.type === 'CONTROL' ? 'control' : 'regulate');

    try {
        const res =
            dispatchMode === 'control'
                ? await monitorControl(pointRef.rid, pointRef.did, pointRef.pid, payload)
                : await monitorRegulate(pointRef.rid, pointRef.did, pointRef.pid, payload);

        return {
            state: !!res.state,
            message: (res.data as {msg?: string} | undefined)?.msg,
        };
    } catch (error) {
        console.warn('[device-manage] dispatch failed', error);
        return {state: false, message: translate('fw.deviceManage.error.dispatchFailed')};
    }
}
