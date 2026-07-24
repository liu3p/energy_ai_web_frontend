import type {ILinePosition} from './attr.type';

export interface IRectBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ILineBox {
    x: number;
    y: number;
    posList: ILinePosition[];
}

export type IBox = IRectBox | ILineBox;
