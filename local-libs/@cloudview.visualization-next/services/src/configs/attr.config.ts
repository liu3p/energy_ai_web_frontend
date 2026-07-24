import type {
    IEllipseAttrConfig,
    IImageAttrConfig,
    ILineAttrConfig,
    IRectAttrConfig,
    ISvgAttrConfig,
    ITextAttrConfig,
} from '../types';
import getSvgAttrConfig from './svg-attr.config';
import getImageAttrConfig from './image-attr.config';
import getRectAttrConfig from './rect-attr.config';
import getEllipseAttrConfig from './ellipse-attr.config';
import getLineAttrConfig from './line-attr.config';
import getTextAttrConfig from './text-attr.config';

export interface IPrimitiveAttrDefaultConfig {
    svg: ISvgAttrConfig;
    image: IImageAttrConfig;
    'svg-rect': IRectAttrConfig;
    'svg-ellipse': IEllipseAttrConfig;
    'svg-line': ILineAttrConfig;
    text: ITextAttrConfig;
}

const attrConfig: IPrimitiveAttrDefaultConfig = {
    svg: getSvgAttrConfig(),
    image: getImageAttrConfig(),
    'svg-rect': getRectAttrConfig(),
    'svg-ellipse': getEllipseAttrConfig(),
    'svg-line': getLineAttrConfig(),
    text: getTextAttrConfig(),
};

export {attrConfig, attrConfig as default};
