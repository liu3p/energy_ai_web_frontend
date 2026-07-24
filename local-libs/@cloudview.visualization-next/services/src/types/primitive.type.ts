import type {EngineTypeEnum, PrimitiveTypeAllEnum} from './constants.type';
import type {IAttributes} from './attr.type';
import type {IAttrDef} from './attr-config.type';
import type {IBinding} from './binding.type';
import type {IStatus} from './status.type';
import type {Layer} from '../classes';

export interface IUserDefined {
    [name: string]: IAttrDef;
}

export interface IPrimitiveContent {
    attributes: IAttributes;
    userDefined: IUserDefined;
    status?: IStatus;
}

export interface IPrimitiveDevice {
    id: string;
    sn: string;
    name: string;
}

export interface IPrimitive {
    id?: string;
    name: string;
    type: PrimitiveTypeAllEnum;
    tag: string;
    description: string;
    enabled: boolean;
    engine_type: EngineTypeEnum;
    model_id?: string;
    model?: string;
    vnb_id: string;
    public: boolean;
    content?: IPrimitiveContent;
    isBasic: boolean;
}

export interface IPrimitiveBindings {
    [name: string]: IBinding;
}

export interface IPrimitiveInstance extends IPrimitiveContent {
    id: string;
    baseId: string;
    modelId: string;
    model?: string;
    layer?: Layer;
    layerId: string;
    name: string;
    type: PrimitiveTypeAllEnum;
    devices: IPrimitiveDevice[];
    isBasic: boolean;
    bindings: IPrimitiveBindings;
    locked: boolean;
    invisible: boolean;
    statusMutualExclusion?: boolean;
}
