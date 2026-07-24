import {Primitive} from './primitive.class';
import type {IPrimitive, IRectAttr, IRectAttrConfig} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import attrConfig from '../configs/attr.config';

export class PrimitiveSvgRect extends Primitive {
    attributes: IRectAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.RECT;
    defaultConfig: IRectAttrConfig = attrConfig['svg-rect'];
    isBasic = true;

    constructor(config?: IPrimitive | null) {
        super(config);
        this.attributes = (config?.content?.attributes as IRectAttr) ?? this._genAttributes();
    }

    setPosition(x: number, y: number): void {
        this.attributes.x = x;
        this.attributes.y = y;
    }
}
