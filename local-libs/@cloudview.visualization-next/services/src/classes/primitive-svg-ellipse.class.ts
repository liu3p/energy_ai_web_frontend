import {Primitive} from './primitive.class';
import type {IEllipseAttr, IEllipseAttrConfig, IPrimitive} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import attrConfig from '../configs/attr.config';

export class PrimitiveSvgEllipse extends Primitive {
    attributes: IEllipseAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.ELLIPSE;
    defaultConfig: IEllipseAttrConfig = attrConfig['svg-ellipse'];
    isBasic = true;

    constructor(config?: IPrimitive | null) {
        super(config);
        this.attributes = (config?.content?.attributes as IEllipseAttr) ?? this._genAttributes();
    }

    setPosition(x: number, y: number): void {
        this.attributes.cx = x + this.attributes.rx;
        this.attributes.cy = y + this.attributes.ry;
    }
}
