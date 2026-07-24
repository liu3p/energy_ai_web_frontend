export enum ITopicTypeEnum {
    TELEMETRY = 'telemetry',
    TELEINDICATION = 'teleindication',
    TELEPULSE = 'telepulse',
    DEVICE_STATE = 'deviceState',
    DEVICE_PROP = 'deviceProp',
}

export interface ITelemetryPayload {
    sn: string;
    identifier: string;
    data_type: string;
    upload_at: string;
    ts: number;
    numeric_value: number | null;
    obj_value: boolean | null;
    str_value: string | null;
    ratio: number | null;
    calculate_value?: number;
}

export interface IDevicePropPayload {
    acquisition_at: string;
    measure_at: string;
    obj_value: boolean | null;
    numeric_value: number | null;
    str_value: string | null;
    sn: string;
    identifier: string;
    data_type: string;
    acquisition_ts: number;
    measure_ts: number;
}

export interface IDeviceStatePayload {
    ts: number;
    sn: string;
    state: boolean;
    upload_at: string;
}

export interface ITelepulsePayload {
    sn: string;
    identifier: string;
    upload_at: string;
    ts: number;
    numeric_value: number;
    ratio?: number;
    calculate_value?: number;
}

export interface ITeleindicationPayload {
    sn: string;
    identifier: string;
    upload_at: string;
    ts: number;
    value: number;
}

export interface IMqttAuth {
    id: string;
    user_name: string;
    password: string;
}

export interface IMqttTopics {
    client_id: string;
    topics: string[];
}
