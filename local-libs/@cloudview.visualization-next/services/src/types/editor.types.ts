import type {IResizePoint} from './resize-point.types';
import type {ILinePosition} from '@cloudview.visualization-next/services';

export interface ISelectStartPoint {
    x: number;
    y: number;
}

export interface ISelectRectBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IMovingRectBox extends ISelectRectBox {
    visible: boolean;
    rotate: number;
    transform: string;
}

export interface IMovingStartPoint extends ISelectStartPoint {
    distanceX: number;
    distanceY: number;
}

export interface IResizeStartPoint extends IMovingStartPoint {
    index: number;
    point: IResizePoint;
}

export interface IBeforeResizeModelStatus {
    x: number;
    y: number;
    width: number;
    height: number;
    posList?: ILinePosition[];
}

export interface IRotateInfo {
    startX: number;
    startY: number;
    rotate: number;
}
