export interface IResizePoint {
    cx: number;
    cy: number;
    cursor: string;
    visible?: boolean;
    needOpacity?: boolean;
    posIndex?: number;
    canDelete?: boolean;
    size: number;
}

export interface IRotatePoint {
    x: number;
    y: number;
    size: number;
    visible: boolean;
}
