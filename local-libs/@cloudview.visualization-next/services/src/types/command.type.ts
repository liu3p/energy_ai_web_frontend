import type {Board} from '../classes/board.class';
import type {PrimitiveInstance} from '../classes/instance-primitive.class';
import type {Layer} from '../classes/layer.class';
import type {IAttributes} from './attr.type';
import type {IStatus} from './status.type';

export interface ICommandAddPrimitiveParams {
    board: Board;
    primitive: PrimitiveInstance;
}

export interface ICommandRemovePrimitivesParams {
    board: Board;
    primitives: Array<{primitive: PrimitiveInstance; index: number}>;
}

export interface ICommandRemovePrimitiveParams {
    board: Board;
    primitive: PrimitiveInstance;
    index: number;
    selected: boolean;
}

export interface ICommandCopyPrimitiveParams {
    board: Board;
    primitives: PrimitiveInstance[];
}

export interface ICommandAddLayerParams {
    board: Board;
    layer: Layer;
}

export interface ICommandRemoveLayerParams {
    board: Board;
    layer?: Layer;
    index: number;
    selectedLayer: Layer;
}

export interface ICommandMoveLayerParams {
    board: Board;
    index: number;
}

export interface ICommandLayerVisibleParams {
    layer: Layer;
    invisible: boolean;
}

export interface ICommandLayerLockParams {
    layer: Layer;
    locked: boolean;
    board: Board;
}

export interface ICommandPrimitiveVisibleParams {
    primitive: PrimitiveInstance;
    invisible: boolean;
}

export interface ICommandPrimitiveLockParams {
    primitive: PrimitiveInstance;
    locked: boolean;
    board: Board;
}

export interface ICommandPrimitiveAttrChangedParams {
    attributes: IAttributes;
    status: null | IStatus;
    id: string;
}

export interface ICommandPrimitiveAttrParams {
    primitives: PrimitiveInstance[];
    attrs: Record<string, ICommandPrimitiveAttrChangedParams>;
}

export interface ICommandPrimitiveResizeParams {
    primitive: PrimitiveInstance;
    attributes: IAttributes;
}

export interface ICommandPrimitiveRotateParams {
    primitive: PrimitiveInstance;
    attributes: IAttributes;
}

export interface ICommandPrimitiveZIndexChangeParams {
    primitive: PrimitiveInstance;
    index: number;
}
