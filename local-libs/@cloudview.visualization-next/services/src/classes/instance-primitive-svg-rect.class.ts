import {PrimitiveInstance} from './instance-primitive.class';
import type {IPrimitive, IPrimitiveInstance, IRectAttr, IRectAttrConfig} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import {attrConfig} from '../configs';
import type {Layer} from './layer.class';
import {Box} from './box.class';

export class PrimitiveInstanceSvgRect extends PrimitiveInstance {
    attributes: IRectAttr = {} as IRectAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.RECT;
    defaultConfig: IRectAttrConfig = attrConfig['svg-rect'];
    box: Box = new Box(this.type);

    assignConfig(config?: IPrimitiveInstance | null) {
        this._assignConfig(config);
    }

    constructor(config?: IPrimitive | IPrimitiveInstance | null, layer?: Layer, name?: string) {
        super(config, layer, name);
        if (config) {
            if ('content' in config) {
                this.attributes = config.content?.attributes
                    ? JSON.parse(JSON.stringify(config.content.attributes))
                    : this.attributes;
            } else {
                config = config as IPrimitiveInstance;
                this.attributes = (config.attributes as IRectAttr) ?? this.attributes;
            }
        }
        this.box.setBox(this.attributes.x, this.attributes.y, this.attributes.width, this.attributes.height);
    }

    getMinX() {
        return this.attributes.x - this.attributes['stroke-width'] / 2;
    }

    getMinY() {
        return this.attributes.y - this.attributes['stroke-width'] / 2;
    }

    getMaxX() {
        return this.attributes.x + this.attributes.width + this.attributes['stroke-width'] / 2;
    }

    getMaxY() {
        return this.attributes.y + this.attributes.height + this.attributes['stroke-width'] / 2;
    }
}
