import type {IBindingValue, IBoardAttr, ICustomBindingDevice} from '../types';

export interface IConfigurationBoard {
    id: string;
    name: string;
    attributes: IBoardAttr;
}

export interface IPrimitiveRuntimePublic {
    getAttr: (key: string) => IBindingValue;
    setAttr: (key: string, value: IBindingValue) => void;
}

export interface IBoardRuntimePublic {
    getAttr: (key: string) => IBindingValue;
    setAttr: (key: string, value: IBindingValue) => void;
}

export interface ICustomComponentShowParam {
    device: ICustomBindingDevice;
    primitive: IPrimitiveRuntimePublic;
    board: IBoardRuntimePublic;
    targetRect?: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
}
