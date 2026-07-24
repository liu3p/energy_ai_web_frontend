export enum EngineTypeEnum {
    '2D' = '2D',
    '3D' = '3D',
    'ALL' = '',
}

export enum PrimitiveTypeEnum {
    IMAGE = 'image',
    SVG = 'svg',
}

export enum PrimitiveTypeAllEnum {
    IMAGE = 'image',
    SVG = 'svg',
    TEXT = 'text',
    RECT = 'svg-rect',
    LINE = 'svg-line',
    ELLIPSE = 'svg-ellipse',
}

export enum ArrowTypeEnum {
    ARROW = 'arrow',
}

export enum ArrowPositionEnum {
    START = 'start',
    END = 'end',
}

export interface IOption {
    value: string | number | boolean | EngineTypeEnum | DataBindingTypeEnum | PrimitiveTypeEnum;
    label: string;
}

export enum DataBindingTypeEnum {
    PRIMITIVE_PROP = 'primitiveProp',
    TELEMETRY = 'telemetry',
    TELEINDICATION = 'teleindication',
    TELEPULSE = 'telepulse',
    DEVICE_INFO = 'deviceInfo',
    DEVICE_PROP = 'deviceProp',
    DEVICE_STATE = 'deviceState',
    CUSTOM_SUBSCRIPTION = 'customSubscription',
    CUSTOM_DATA = 'customData',
    CUSTOM_ACTION = 'customAction',
    CUSTOM_COMPONENT = 'customComponent',
    SCRIPT = 'script',
    BOARD_ARGS = 'boardArgs',
    TELECONTROL = 'telecontrol',
    TELEADJUST = 'teleadjust',
    BOARD_TOGGLE = 'boardToggle',
    LINK_TO = 'linkTo',
    LINT_TO_CONFIGURATION = 'linkToConfiguration',
    DIALOG = 'dialog',
    POPOVER = 'popover',
}

export interface IErrorData {
    code: number;
    msg: string;
    args?: Array<string | number>;
}

export enum DataEngineEvent {
    DIALOG_TRIGGER = 'dialogTrigger',
    TELECONTROL_TRIGGER = 'telecontrolTrigger',
    TELEADJUST_TRIGGER = 'teleadjustTrigger',
    POPOVER_TRIGGER = 'popoverTrigger',
    BOARD_TOGGLE_TRIGGER = 'boardToggleTrigger',
    LINK_TO_CONFIGURATION_TRIGGER = 'linkToConfigurationTrigger',
    CUSTOM_COMPONENT_TRIGGER = 'customComponentTrigger',
    ERROR = 'error',
}
