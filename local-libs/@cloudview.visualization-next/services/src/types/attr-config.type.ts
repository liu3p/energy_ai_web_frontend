import type {IOption} from './constants.type';
import type {AttrTypeEnum} from '../tokens';

// 属性定义的结构
export interface IAttrBaseDef {
    id: string;
    type: AttrTypeEnum;
    tag: string;
    name: string;
    readonly: boolean;
    desc: string;
    attrType: string;
    disabled?: boolean;
    hiddenInPrimitive?: boolean;
}

export interface IAttrNumberDef extends IAttrBaseDef {
    value: number;
    min?: number;
    needMin: boolean;
    step: number;
    needMax: boolean;
    max?: number;
}

export interface IAttrTextDef extends IAttrBaseDef {
    value: string;
}

export interface IAttrColorDef extends IAttrBaseDef {
    value: string | null;
}

export interface IAttrBoolDef extends IAttrBaseDef {
    value: boolean;
}

export interface IAttrSelectDef extends IAttrBaseDef {
    value: string;
    options: IOption[];
}

export type IAttrDef = IAttrNumberDef | IAttrTextDef | IAttrColorDef | IAttrBoolDef | IAttrSelectDef;

// svg图元的svg属性定义
export interface ISvgAttrSvgConfig {
    x: IAttrNumberDef;
    y: IAttrNumberDef;
    width: IAttrNumberDef;
    height: IAttrNumberDef;
    fill: IAttrColorDef;
    'fill-opacity': IAttrNumberDef;
    opacity: IAttrNumberDef;
}

export interface IAttrTransformConfig {
    rotate: IAttrNumberDef;
    'horizontal-flip': IAttrBoolDef;
    'vertical-flip': IAttrBoolDef;
}

// svg图元的图形转换属性定义
export type ISvgAttrTransformConfig = IAttrTransformConfig;

// svg图元的其他属性定义
export interface ISvgAttrOtherConfig {
    title: IAttrTextDef;
    style: IAttrTextDef;
}

// 动画属性定义
export interface IAttrAnimationConfig {
    flash: IAttrBoolDef;
    'flash-dur': IAttrNumberDef;
    'flash-begin': IAttrNumberDef;
}

// svg图元的动画属性定义
export type ISvgAttrAnimationConfig = IAttrAnimationConfig;

// 事件属性定义
interface IAttrEventConfig {
    click: IAttrTextDef;
    dblclick: IAttrTextDef;
    mouseenter: IAttrTextDef;
    mouseleave: IAttrTextDef;
}

export type ISvgAttrEventConfig = IAttrEventConfig;

// svg图元所有属性定义
export type ISvgAttrConfig = ISvgAttrSvgConfig &
    ISvgAttrTransformConfig &
    ISvgAttrEventConfig &
    ISvgAttrOtherConfig &
    ISvgAttrAnimationConfig;

// 图片图元
export interface IImageAttrSvgConfig {
    x: IAttrNumberDef;
    y: IAttrNumberDef;
    width: IAttrNumberDef;
    height: IAttrNumberDef;
    opacity: IAttrNumberDef;
}

export type IImageAttrTransformConfig = IAttrTransformConfig;

export type IImageAttrEventConfig = IAttrEventConfig;

export type IImageAttrAnimationConfig = IAttrAnimationConfig;

export interface IImageAttrOtherConfig {
    title: IAttrTextDef;
}

export type IImageAttrConfig = IImageAttrSvgConfig &
    IImageAttrTransformConfig &
    IImageAttrEventConfig &
    IImageAttrOtherConfig &
    IImageAttrAnimationConfig;

// 基础图元：矩形
export interface IRectAttrSvgConfig {
    x: IAttrNumberDef;
    y: IAttrNumberDef;
    width: IAttrNumberDef;
    height: IAttrNumberDef;
    fill: IAttrColorDef;
    'fill-opacity': IAttrNumberDef;
    opacity: IAttrNumberDef;
    stroke: IAttrColorDef;
    'stroke-dasharray': IAttrTextDef;
    'stroke-opacity': IAttrNumberDef;
    'stroke-width': IAttrNumberDef;
}

export type IRectAttrTransformConfig = IAttrTransformConfig;

export type IRectAttrEventConfig = IAttrEventConfig;

export type IRectAttrAnimationConfig = IAttrAnimationConfig;

export interface IRectAttrOtherConfig {
    title: IAttrTextDef;
}

export type IRectAttrConfig = IRectAttrSvgConfig &
    IRectAttrTransformConfig &
    IRectAttrEventConfig &
    IRectAttrOtherConfig &
    IRectAttrAnimationConfig;

// 基础图元：椭圆
export interface IEllipseAttrSvgConfig {
    cx: IAttrNumberDef;
    cy: IAttrNumberDef;
    rx: IAttrNumberDef;
    ry: IAttrNumberDef;
    fill: IAttrColorDef;
    'fill-opacity': IAttrNumberDef;
    opacity: IAttrNumberDef;
    stroke: IAttrColorDef;
    'stroke-dasharray': IAttrTextDef;
    'stroke-opacity': IAttrNumberDef;
    'stroke-width': IAttrNumberDef;
}

export type IEllipseAttrTransformConfig = IAttrTransformConfig;

export type IEllipseAttrEventConfig = IAttrEventConfig;

export type IEllipseAttrAnimationConfig = IAttrAnimationConfig;

export interface IEllipseAttrOtherConfig {
    title: IAttrTextDef;
}

export type IEllipseAttrConfig = IEllipseAttrSvgConfig &
    IEllipseAttrTransformConfig &
    IEllipseAttrEventConfig &
    IEllipseAttrOtherConfig &
    IEllipseAttrAnimationConfig;

// 基础图元: 线
export interface ILineAttrSvgConfig {
    x: IAttrNumberDef;
    y: IAttrNumberDef;
    opacity: IAttrNumberDef;
    stroke: IAttrColorDef;
    'stroke-dasharray': IAttrTextDef;
    'stroke-opacity': IAttrNumberDef;
    'stroke-width': IAttrNumberDef;
    'background-visible': IAttrBoolDef;
    'background-color': IAttrColorDef;
    'background-opacity': IAttrNumberDef;
    'background-width': IAttrNumberDef;
}

export type ILineAttrEventConfig = IAttrEventConfig;

export interface ILineAttrAnimationConfig extends IAttrAnimationConfig {
    'stream-animation': IAttrBoolDef;
    'stream-direction-reverse': IAttrBoolDef;
    'stream-speed': IAttrNumberDef;
}

export interface ILineAttrOtherConfig {
    title: IAttrTextDef;
    // 'start-arrow': IAttrTextDef;
    // 'end-arrow': IAttrTextDef;
}

export type ILineAttrConfig = ILineAttrSvgConfig &
    ILineAttrEventConfig &
    ILineAttrOtherConfig &
    ILineAttrAnimationConfig;

// 基础图元： 文本
export interface ITextAttrSvgConfig {
    x: IAttrNumberDef;
    y: IAttrNumberDef;
    width: IAttrNumberDef;
    height: IAttrNumberDef;
}

export type ITextAttrTransformConfig = IAttrTransformConfig;

export type ITextAttrEventConfig = IAttrEventConfig;

export type ITextAttrAnimationConfig = IAttrAnimationConfig;

export interface ITextAttrOtherConfig {
    title: IAttrTextDef;
    style: IAttrTextDef;
    content: IAttrTextDef;
    'content-prefix': IAttrTextDef;
    'content-suffix': IAttrTextDef;
}

export interface ITextAttrCssConfig {
    opacity: IAttrNumberDef;
    'background-color': IAttrColorDef;
    color: IAttrColorDef;
    'font-size': IAttrNumberDef;
    'font-weight': IAttrBoolDef;
    'font-style': IAttrBoolDef;
    'text-decoration-line': IAttrBoolDef;
    'text-align': IAttrSelectDef;
    'vertical-align': IAttrSelectDef;
}

export type ITextAttrConfig = ITextAttrSvgConfig &
    ITextAttrTransformConfig &
    ITextAttrEventConfig &
    ITextAttrOtherConfig &
    ITextAttrAnimationConfig &
    ITextAttrCssConfig;

export interface IBoardAttrConfig {
    'background-color': IAttrColorDef;
    panDisable: IAttrBoolDef;
    zoomDisable: IAttrBoolDef;
}

export type IPrimitiveAttrConfig =
    | ISvgAttrConfig
    | IImageAttrConfig
    | IRectAttrConfig
    | IEllipseAttrConfig
    | ILineAttrConfig
    | ITextAttrConfig;

export type IAttrConfig = IPrimitiveAttrConfig | IBoardAttrConfig;
