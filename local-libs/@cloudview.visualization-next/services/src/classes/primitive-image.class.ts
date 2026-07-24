import type {IImageAttr, IImageAttrConfig, IPrimitive} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import attrConfig from '../configs/attr.config';
import {Primitive} from './primitive.class';

export class PrimitiveImage extends Primitive {
    attributes: IImageAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.IMAGE;
    defaultConfig: IImageAttrConfig = attrConfig.image;

    constructor(config?: IPrimitive | null) {
        super(config);
        this.attributes = (config?.content?.attributes as IImageAttr) ?? this._genAttributes<IImageAttr>();
    }

    setPosition(x: number, y: number): void {
        this.attributes.x = x;
        this.attributes.y = y;
    }
}
