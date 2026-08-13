import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';
import {translate} from '@/shims/cloudview-ui-next/locale-store';
import {parseMonitorPointRef} from '../device-manage/station-model.util';
import type {StrategyApiItem, StrategyApiResponse, StrategyRunValue, StrategySection} from './operation-strategy.types';
import {parseStrategyResponse} from './strategy.util';

interface DispatchPayload {
    value: string | number;
    checkpwd: string;
}

interface AgcDataResponse {
    station_model?: unknown;
    strategy_model?: StrategyApiResponse | {data: StrategyApiResponse; method?: string; model?: string};
}

function extractStrategyPayload(data: unknown): StrategyApiResponse | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const payload = data as Record<string, unknown>;
    if (Array.isArray(payload.strategy)) {
        return {strategy: payload.strategy as StrategyApiItem[]};
    }
    if (Array.isArray(data)) {
        return {strategy: data as StrategyApiItem[]};
    }
    if (payload.data && typeof payload.data === 'object') {
        return extractStrategyPayload(payload.data);
    }

    return null;
}

function hasSettingList(strategyList: StrategyApiItem[] | undefined): strategyList is StrategyApiItem[] {
    return !!strategyList?.length && Array.isArray(strategyList[0]?.setting);
}

export async function fetchStrategySections(): Promise<StrategySection[]> {
    try {
        const res = await http.get<AgcDataResponse | StrategyApiResponse>('/log/agc/strategy_model');
        if (!res.state || !res.data) {
            return [];
        }

        const payload = (res.data as AgcDataResponse).strategy_model
            ? extractStrategyPayload((res.data as AgcDataResponse).strategy_model)
            : extractStrategyPayload(res.data);
        if (payload && hasSettingList(payload.strategy)) {
            return parseStrategyResponse(payload);
        }
    } catch (error) {
        console.warn('[operation-strategy] fetch strategy model failed', error);
    }

    return [];
}

export function monitorControl(rid: string, did: string, pid: string, data: DispatchPayload): Promise<Response<any>> {
    return http.post(`/log/datamonitor/rtu/${rid}/device/${did}/point/${pid}/control`, data);
}

export function monitorRegulate(rid: string, did: string, pid: string, data: DispatchPayload): Promise<Response<any>> {
    return http.post(`/log/datamonitor/rtu/${rid}/device/${did}/point/${pid}/regulate`, data);
}

export async function dispatchStrategyRunValue(
    runValue: StrategyRunValue,
    value: string | number,
    checkpwd: string,
): Promise<{state: boolean; message?: string}> {
    if (!runValue.database_id) {
        return {state: false, message: translate('fw.deviceManage.error.noDatabaseId')};
    }

    const pointRef = parseMonitorPointRef(runValue.database_id);
    if (!pointRef) {
        return {state: false, message: translate('fw.deviceManage.error.invalidPointId')};
    }

    const payload: DispatchPayload = {value, checkpwd};
    const dispatchMode = runValue.dispatchMode ?? (runValue.dataType === 'float' ? 'regulate' : 'control');

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
        console.warn('[operation-strategy] dispatch failed', error);
        return {state: false, message: translate('fw.operationStrategy.dispatch.dispatchFailed')};
    }
}

export async function dispatchStrategyValue(
    sectionId: string,
    fieldName: string,
    value: string,
): Promise<{state: boolean; message?: string}> {
    try {
        const res = await http.post(`/log/agc/strategy/${sectionId}/params`, [{name: fieldName, value}]);
        return {
            state: !!res.state,
            message: (res.data as {msg?: string} | undefined)?.msg,
        };
    } catch (error) {
        console.warn('[operation-strategy] dispatch failed', error);
        return {state: false, message: translate('fw.operationStrategy.dispatch.dispatchFailed')};
    }
}

export async function updateRunValueControllable(
    sectionId: string,
    fieldName: string,
    value: string,
): Promise<{state: boolean}> {
    const res = await dispatchStrategyValue(sectionId, fieldName, value);
    return {state: res.state};
}
