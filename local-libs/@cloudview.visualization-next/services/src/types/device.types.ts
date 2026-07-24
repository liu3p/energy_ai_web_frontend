export interface ITelemetry {
    'data_type': string;
    'data_type_spec': number[];
    'group': string[];
    'identifier': string;
    'name': string;
    'sn': string;
    'unit_content': string;
    'unit_id': string;
}

export type ITelePulse = ITelemetry;

export interface ITeleIndication {
    'data_type': string;
    'data_type_spec': number[];
    'group': string[];
    'identifier': string;
    'name': string;
    'sn': string;
}

export interface ITelecontrolParameter {
    'data_type': string;
    'data_type_spec':
        | {key: string; name: string}[]
        | {lower_limit: number; upper_limit: number}
        | {max_length: number; min_length: number}
        | Record<string, never>;
    'default': string;
    'identifier': string;
    'name': string;
    'source': number;
    'unit_id': string;
}

export interface ITelecontrol {
    'device_timeout': number;
    'group': string[];
    'identifier': string;
    'name': string;
    'parameters': ITelecontrolParameter[];
    'platform_timeout': number;
}

export interface IDeviceProperty {
    'data_type': string;
    'data_type_spec': number[];
    'group': string[];
    'identifier': string;
    'name': string;
    'rw': string;
    'sn': string;
    'unit_content': string;
    'unit_id': string;
}

export interface IDevice {
    id: string;
    device_type: number;
    model_id: string;
    model_name: string;
    name: string;
    product_name: string;
    sn: string;
    state: boolean;
    station_id: string;
    station_name: string;

    [key: string]: any;
}

export interface ITelecontrolHistory {
    'create_at': string;
    'create_by': string;
    'device_id': string;
    'nickname': string;
    'recv_payload': any[];
    'send_payload': {method: string; payload: any}[];
    'status': number;
    'update_at': string;
    'username': string;
}

export type ITeleajustHistory = ITelecontrolHistory;

export type ITeleajustParameter = ITelecontrolParameter;

export interface ITeleajust extends ITelecontrol {
    'parameters': ITeleajustParameter[];
}
