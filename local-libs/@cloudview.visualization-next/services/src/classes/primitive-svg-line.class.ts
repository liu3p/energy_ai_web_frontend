import {Primitive} from './primitive.class';
import type {ILineAttr, ILineAttrConfig, IPrimitive} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import attrConfig from '../configs/attr.config';

export class PrimitiveSvgLine extends Primitive {
    attributes: ILineAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.LINE;
    defaultConfig: ILineAttrConfig = attrConfig['svg-line'];
    isBasic = true;

    constructor(config?: IPrimitive | null) {
        super(config);
        this.attributes = (config?.content?.attributes as ILineAttr) ?? this._genAttributes();
    }

    setPosition(x: number, y: number): void {
        const disX = this.attributes.x2 - this.attributes.x1;
        const disY = this.attributes.y2 - this.attributes.y1;
        this.attributes.x1 = x;
        this.attributes.y1 = y;
        this.attributes.x2 = x + disX;
        this.attributes.y2 = y + disY;
    }
}
