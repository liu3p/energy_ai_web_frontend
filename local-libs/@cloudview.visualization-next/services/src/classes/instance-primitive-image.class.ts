import {PrimitiveInstance} from './instance-primitive.class';
import type {IImageAttr, IImageAttrConfig, IPrimitive, IPrimitiveInstance} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import {attrConfig} from '../configs';
import {Box} from './box.class';
import type {Layer} from './layer.class';

export class PrimitiveInstanceImage extends PrimitiveInstance {
    attributes: IImageAttr = {} as IImageAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.IMAGE;
    defaultConfig: IImageAttrConfig = attrConfig.image;
    model = '';

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
                this.attributes = (config.attributes as IImageAttr) ?? this.attributes;
            }
        }
        this.box.setBox(this.attributes.x, this.attributes.y, this.attributes.width, this.attributes.height);
    }

    setModel(model: string) {
        this.model = model;
    }
}
