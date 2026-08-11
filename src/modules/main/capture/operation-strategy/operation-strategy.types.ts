export type StrategySettingType = 'CONTROL' | 'REGULATE' | 'ATTRIBUTE';
export type StrategyDispatchMode = 'control' | 'regulate';

export interface StrategySetting {
    name: string;
    desc: string;
    type: StrategySettingType;
    value: string;
    min: string;
    max: string;
    database_id?: string;
}

export interface StrategyApiItem {
    name: string;
    setting: StrategySetting[];
}

export interface StrategyApiResponse {
    strategy?: StrategyApiItem[];
}

export type StrategyDataType = 'boolean' | 'enum' | 'float' | 'datetime' | 'text';

export interface StrategyRunValue {
    id: string;
    fieldName: string;
    name: string;
    value: string;
    unit?: string;
    dataType: StrategyDataType;
    controllable: boolean;
    dispatchable: boolean;
    database_id?: string;
    dispatchMode?: StrategyDispatchMode;
    hint?: string;
    min?: string;
    max?: string;
    options?: Array<{label: string; value: string}>;
}

export interface StrategyParamValue {
    id: string;
    fieldName: string;
    name: string;
    value: string;
    unit?: string;
    range: string;
    description: string;
}

export interface StrategySection {
    id: string;
    title: string;
    active: boolean;
    runValues: StrategyRunValue[];
    paramValues: StrategyParamValue[];
}

export interface DispatchTarget {
    sectionId: string;
    runValue: StrategyRunValue;
}
