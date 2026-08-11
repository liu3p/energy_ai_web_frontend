export type ParamType = 'DIGITAL' | 'ANALOG' | 'ATTRIBUTE';

export interface StationParam {
    name: string;
    value: string | number;
    type: ParamType;
    max?: string;
    min?: string;
    database_id?: string;
}

export interface DynParam {
    database_id: string;
    name: string;
    type: ParamType;
    value: string | number | null;
}

export interface StationNode {
    type: string;
    name: string;
    para?: StationParam[];
    dyn_para?: DynParam[];
    [key: string]: unknown;
}

export interface DeviceTreeNode {
    key: string;
    type: string;
    name: string;
    label: string;
    para: StationParam[];
    dyn_para: DynParam[];
    children: DeviceTreeNode[];
}

export type DispatchMode = 'control' | 'regulate';

export interface ParamCardItem {
    key: string;
    name: string;
    label: string;
    value: string | number | null;
    unit: string;
    type: ParamType;
    dispatchable: boolean;
    dispatchMode?: DispatchMode;
    database_id?: string;
    max?: string;
    min?: string;
}

export interface ParamCardGroup {
    title: string;
    showDispatch: boolean;
    items: ParamCardItem[];
}
