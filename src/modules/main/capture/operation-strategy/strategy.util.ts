import {translate} from '@/shims/cloudview-ui-next/locale-store';
import type {
    StrategyApiItem,
    StrategyApiResponse,
    StrategyDataType,
    StrategyParamValue,
    StrategyRunValue,
    StrategySection,
    StrategySetting,
} from './operation-strategy.types';

function translateOperationStrategy(path: string, fallback: string): string {
    const key = `fw.operationStrategy.${path}`;
    const value = translate(key);
    return value === key ? fallback : value;
}

function isActiveValue(value: string): boolean {
    return value === '1' || value === 'true' || value === 'TRUE';
}

function formatRange(min: string, max: string): string {
    if (min !== '' || max !== '') {
        return `${min}~${max}`;
    }
    return '--';
}

function mapDataType(setting: StrategySetting): StrategyDataType {
    if (setting.min === '0' && setting.max === '1') {
        return 'boolean';
    }
    if (setting.name === 'PCSControlMode') {
        return 'enum';
    }
    return 'float';
}

function buildBooleanOptions() {
    return [
        {label: translateOperationStrategy('option.yesEnable', '是/启用'), value: '1'},
        {label: translateOperationStrategy('option.noDisable', '否/停用'), value: '0'},
    ];
}

function buildPcsControlModeOptions() {
    return [
        {label: translateOperationStrategy('option.remoteControl', '遥控'), value: '0'},
        {label: translateOperationStrategy('option.remoteAdjust', '遥调'), value: '1'},
    ];
}

export function getDataTypeLabel(dataType: StrategyDataType): string {
    return translateOperationStrategy(`dataType.${dataType}`, dataType);
}

function mapControlSetting(setting: StrategySetting): StrategyRunValue {
    const dataType = mapDataType(setting);

    return {
        id: setting.name,
        fieldName: setting.name,
        name: setting.desc || setting.name,
        value: setting.value,
        dataType,
        controllable: true,
        dispatchable: true,
        database_id: setting.database_id,
        dispatchMode: dataType === 'float' ? 'regulate' : 'control',
        hint: formatDispatchHint({name: setting.desc || setting.name, dataType}),
        min: setting.min,
        max: setting.max,
        options:
            dataType === 'boolean'
                ? buildBooleanOptions()
                : setting.name === 'PCSControlMode'
                  ? buildPcsControlModeOptions()
                  : undefined,
    };
}

function mapRegulateSetting(setting: StrategySetting): StrategyParamValue {
    return {
        id: setting.name,
        fieldName: setting.name,
        name: setting.desc || setting.name,
        value: setting.value,
        range: formatRange(setting.min, setting.max),
        description: setting.desc,
    };
}

function mapAttributeSetting(setting: StrategySetting): StrategyParamValue {
    return {
        id: setting.name,
        fieldName: setting.name,
        name: setting.name,
        value: setting.value,
        range: formatRange(setting.min, setting.max),
        description: setting.desc,
    };
}

export function formatDispatchHint(runValue: Pick<StrategyRunValue, 'name' | 'dataType'>): string {
    const prefix =
        runValue.dataType === 'boolean'
            ? translateOperationStrategy('hint.enableOrDisable', '启用或停用')
            : translateOperationStrategy('hint.startOrStop', '启动或停用');
    let subject = runValue.name;
    if (runValue.dataType === 'boolean' && subject.endsWith('启用')) {
        subject = subject.slice(0, -2);
    }
    return `${prefix}${subject}`;
}

export function formatRunValueDisplay(runValue: StrategyRunValue): string {
    if (runValue.dataType === 'boolean') {
        return isActiveValue(String(runValue.value)) ? 'true' : 'false';
    }
    if (runValue.fieldName === 'PCSControlMode') {
        return runValue.value === '1'
            ? translateOperationStrategy('option.remoteAdjust', '遥调')
            : translateOperationStrategy('option.remoteControl', '遥控');
    }
    if (runValue.unit && runValue.value !== '-') {
        return `${runValue.value} ${runValue.unit}`;
    }
    return String(runValue.value ?? '--');
}

export function formatParamValueDisplay(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '--';
    }
    return String(value);
}

export function parseStrategyResponse(payload: StrategyApiResponse | StrategyApiItem[]): StrategySection[] {
    const strategyList = Array.isArray(payload) ? payload : payload.strategy ?? [];

    return strategyList.map(item => {
        const activateSetting = item.setting.find(setting => setting.name === 'Activate');
        const active = activateSetting ? isActiveValue(String(activateSetting.value)) : false;

        const runValues = item.setting
            .filter(setting => setting.type === 'CONTROL' && setting.name !== 'Activate')
            .map(setting => mapControlSetting(setting));

        const paramValues = item.setting
            .filter(setting => setting.type === 'REGULATE' || setting.type === 'ATTRIBUTE')
            .map(setting =>
                setting.type === 'ATTRIBUTE' ? mapAttributeSetting(setting) : mapRegulateSetting(setting),
            );

        return {
            id: item.name,
            title: item.name,
            active,
            runValues,
            paramValues,
        };
    });
}
