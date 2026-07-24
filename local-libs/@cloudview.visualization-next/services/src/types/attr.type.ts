// 动画属性
import type {LinePathType} from '../tokens/constants';

export interface IAttrAnimation {
    flash: boolean;
    'flash-begin': number;
    'flash-dur': number;
}

export type ISvgAttrAnimation = IAttrAnimation;

export type IImageAttrAnimation = IAttrAnimation;

export type IRectAttrAnimation = IAttrAnimation;

export type IEllipseAttrAnimation = IAttrAnimation;

export interface ILineAttrAnimation extends IAttrAnimation {
    'stream-animation': boolean;
    'stream-direction-reverse': boolean;
    'stream-speed': number;
}

export type ITextAttrAnimation = IAttrAnimation;

// 其他属性
export interface IAttrOther {
    title: string;
}

export interface ISvgAttrOther extends IAttrOther {
    style: string;
}

export type IImageAttrOther = IAttrOther;

export interface ILineAttrOther extends IAttrOther {
    'start-arrow': string;
    'end-arrow': string;
}

export type IRectAttrOther = IAttrOther;

export type IEllipseAttrOther = IAttrOther;

export interface ITextAttrOther extends IAttrOther {
    style: string;
    'content-prefix': string;
    content: string;
    'content-suffix': string;
}

// svg 属性
export interface IAttrSvg {
    x: number;
    y: number;
    height: number;
    width: number;
}

export interface ISvgAttrSvg extends IAttrSvg {
    'fill-opacity': number;
    fill: string;
    opacity: number;
    statusMutualExclusion: boolean;
}

export interface IImageAttrSvg extends IAttrSvg {
    opacity: number;
    preserveAspectRatio: boolean;
}

export interface IRectAttrSvg extends IAttrSvg {
    'fill-opacity': number;
    fill: string;
    opacity: number;
    stroke: string;
    'stroke-dasharray': string;
    'stroke-opacity': number;
    'stroke-width': number;
}

export type ITextAttrSvg = IAttrSvg;

export interface ILinePosition {
    type: LinePathType;
    x: number;
    y: number;
}

export interface ILineAttrSvg {
    x: number;
    y: number;
    posList: ILinePosition[];
    opacity: number;
    stroke: string;
    'stroke-dasharray': string;
    'stroke-opacity': number;
    'stroke-width': number;
    'background-opacity': number;
    'background-color': string | null;
    'background-width': number;
    'background-visible': boolean;
}

export interface IEllipseAttrSvg {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    opacity: number;
    fill: string;
    'fill-opacity': number;
    stroke: string;
    'stroke-dasharray': string;
    'stroke-opacity': number;
    'stroke-width': number;
}

// 图形变换属性
export interface IAttrTransform {
    rotate: number;
    'horizontal-flip': boolean;
    'vertical-flip': boolean;
}

export type ISvgAttrTransform = IAttrTransform;

export type IImageAttrTransform = IAttrTransform;

export type IRectAttrTransform = IAttrTransform;

export type IEllipseAttrTransform = IAttrTransform;

export type ITextAttrTransform = IAttrTransform;

export interface ILineAttrTransform {
    rotate?: number;
}

// css 属性

export interface ITextAttrCss {
    opacity: number;
    'background-color': string | null;
    color: string | null;
    'font-size': number;
    'font-weight': boolean;
    'font-style': boolean;
    'text-decoration-line': boolean;
    'text-align': string;
    'vertical-align': string;
}

export type ISvgAttr = ISvgAttrSvg & ISvgAttrTransform & ISvgAttrAnimation & ISvgAttrOther;

export type IImageAttr = IImageAttrSvg & IImageAttrTransform & IImageAttrAnimation & IImageAttrOther;

export type ITextAttr = ITextAttrSvg & ITextAttrCss & ITextAttrTransform & ITextAttrAnimation & ITextAttrOther;

export type IRectAttr = IRectAttrSvg & IRectAttrTransform & IRectAttrAnimation & IRectAttrOther;

export type IEllipseAttr = IEllipseAttrSvg & IEllipseAttrTransform & IEllipseAttrAnimation & IEllipseAttrOther;

export type ILineAttr = ILineAttrSvg & ILineAttrTransform & ILineAttrAnimation & ILineAttrOther;

export type IAttributes = ISvgAttr | IImageAttr | ITextAttr | IRectAttr | IEllipseAttr | ILineAttr;
