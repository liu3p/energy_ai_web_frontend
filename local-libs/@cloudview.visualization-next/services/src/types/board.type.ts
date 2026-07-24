import type {ILayer} from './layer.type';
import type {ViewBoxLike} from '@svgdotjs/svg.js';
import type {IAttrDef} from './attr-config.type';

export interface IBoardAttrCss {
    'background-color': string | null;
}

export interface IPan {
    x: number;
    y: number;
}

export interface IBoardAttrPanZoom {
    viewBox: ViewBoxLike;
}

export interface IBoardAttrOther {
    panDisable: boolean;
    zoomDisable: boolean;
}

export type IBoardAttr = IBoardAttrCss & IBoardAttrPanZoom & IBoardAttrOther;

export interface IEditConfig {
    invisibleIds: Record<string, boolean>;
    lockedIds: Record<string, boolean>;
}

export interface IBoard {
    boardId: string;
    boardName: string;
    attributes?: IBoardAttr;
    editConfig?: IEditConfig;
    parameters?: Record<string, IAttrDef>;
    layers?: ILayer[];
}
