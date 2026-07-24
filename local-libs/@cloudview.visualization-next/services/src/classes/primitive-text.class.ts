import type {IPrimitive, ITextAttr, ITextAttrConfig} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import attrConfig from '../configs/attr.config';
import {Primitive} from './primitive.class';

export class PrimitiveText extends Primitive {
    attributes: ITextAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.TEXT;
    defaultConfig: ITextAttrConfig = attrConfig.text;
    isBasic = true;

    constructor(config?: IPrimitive | null) {
        super(config);
        this.attributes = (config?.content?.attributes as ITextAttr) ?? this._genAttributes();
    }

    setPosition(x: number, y: number): void {
        this.attributes.x = x;
        this.attributes.y = y;
    }
}
