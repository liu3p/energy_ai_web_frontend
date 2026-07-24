import type {DataBindingTypeEnum} from './constants.type';
import type {IBoardRuntimePublic, IPrimitiveRuntimePublic} from './player.type';
import type {Component} from 'vue';

export type IBindingValue = string | number | boolean | null | undefined;

export interface IBindingBase {
    // 数据绑定类型
    type: DataBindingTypeEnum;
    // 图元属性类型
    attrType: string;
    // 转换定义
    convertDefinition: string;
    // convertType: string;
}

export interface IBindingActionBase {
    // 数据绑定类型
    type: DataBindingTypeEnum;
    // 图元属性类型
    attrType: string;
}

export interface IBindingPrimitiveProp extends IBindingBase {
    primitiveId: string;
    primitiveProps: Array<string>;
}

export interface IBindingTelemetry extends IBindingBase {
    deviceId: string;
    deviceSn: string;
    topic: string;
}

export interface IBindingTeleindication extends IBindingTelemetry {
    translateToLabel: boolean;
}

export type IBindingTelepulse = IBindingTelemetry;

export type IBindingDeviceProp = IBindingTelemetry;

export interface IBindingDeviceInfo extends IBindingBase {
    deviceId: string;
    deviceSn: string;
    deviceInfo: string;
}

export interface IBindingDeviceState extends IBindingBase {
    deviceId: string;
    deviceSn: string;
}

export interface IBindingCustomData extends IBindingBase {
    customKey: string;
    deviceId: string;
    deviceSn: string;
}

export interface IBindingCustomSubscribe extends IBindingCustomData {
    customFormatter?: (data: any) => IBindingValue;
}

export interface IBindingCustomAction extends IBindingActionBase {
    customKey: string;
    deviceId: string;
    deviceSn: string;
}

export interface IBindingCustomComponent extends IBindingActionBase {
    customKey: string;
    deviceId: string;
    deviceSn: string;
}

export interface IBindingScript extends IBindingActionBase {
    eventAction: string;
}

export interface IBindingBoardArgs extends IBindingBase {
    args: string[];
}

export interface IBindingTelecontrol extends IBindingActionBase {
    deviceId: string;
    deviceSn: string;
}

export type IBindingTeleadjust = IBindingTelecontrol;

export interface IBindingBoardToggle extends IBindingActionBase {
    boardId: string;
}

export interface IBindingLinkTo extends IBindingActionBase {
    blank: boolean;
    url: string;
}

export interface IBindingLinkToConfiguration extends IBindingActionBase {
    configurationId: string;
}

export interface IBindingInsert {
    [name: string]: IValueBinding;
}

export interface IBindingDialog extends IBindingActionBase {
    template: string;
    content: string;
    width: string;
    title: string;
    insertBindings: IBindingInsert;
}

export interface IBindingPopover extends IBindingDialog {
    backColor: string;
    foreColor: string;
    direction: 'top' | 'bottom' | 'left' | 'right';
}

export type IValueBinding =
    | IBindingPrimitiveProp
    | IBindingTelemetry
    | IBindingDeviceState
    | IBindingBoardArgs
    | IBindingCustomSubscribe
    | IBindingDeviceProp
    | IBindingDeviceInfo
    | IBindingTelepulse
    | IBindingScript
    | IBindingCustomData
    | IBindingTeleindication;

export type IActionBinding =
    | IBindingTelecontrol
    | IBindingTeleadjust
    | IBindingLinkTo
    | IBindingLinkToConfiguration
    | IBindingBoardToggle
    | IBindingDialog
    | IBindingPopover
    | IBindingScript
    | IBindingCustomAction
    | IBindingCustomComponent;

export type ISubscribeBinding =
    | IBindingTeleindication
    | IBindingTelepulse
    | IBindingTelemetry
    | IBindingDeviceProp
    | IBindingDeviceState;

export type IBindingStatus = IValueBinding & {gIndex: number};

export type IBinding = IValueBinding | IActionBinding | IBindingStatus;

export interface ICustomBindingDevice {
    id: string;
    sn: string;
}

export interface ICustomSubscriptionDefinition {
    label: string;
    needSelectDevice?: boolean;
    topic: ((device?: ICustomBindingDevice) => Promise<string> | string) | string;
    getInitialValue: (device?: ICustomBindingDevice) => Promise<IBindingValue> | IBindingValue;
    formatter?: (value: unknown) => Promise<IBindingValue> | IBindingValue;
}

export interface ICustomDataDefinition {
    label: string;
    needSelectDevice?: boolean;
    get: (device?: ICustomBindingDevice) => Promise<IBindingValue> | IBindingValue;
    needLoop?: boolean;
    loopInterval?: number;
}

export interface ICustomActionDefinition {
    label: string;
    needSelectDevice?: boolean;
    action: ({
        device,
        primitive,
        board,
    }: {
        device?: ICustomBindingDevice;
        primitive: IPrimitiveRuntimePublic;
        board: IBoardRuntimePublic;
    }) => void;
}

export interface ICustomComponentDefinition {
    label: string;
    needSelectDevice?: true;
    component: Component;
    componentProps?: Record<string, unknown>;
}

export type IWithDeviceBinding = IBinding & {deviceId: string; deviceSn: string};

export interface ICustomDefinition {
    subscriptions?: Record<string, ICustomSubscriptionDefinition>;
    data?: Record<string, ICustomDataDefinition>;
    actions?: Record<string, ICustomActionDefinition>;
    components?: Record<string, ICustomComponentDefinition>;
}
