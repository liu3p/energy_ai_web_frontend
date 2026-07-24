import {PrimitiveInstance} from './instance-primitive.class';
import type {IPrimitive, IPrimitiveInstance, ITextAttr, ITextAttrConfig} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import {attrConfig} from '../configs';
import {Box} from './box.class';
import type {Layer} from './layer.class';

export class PrimitiveInstanceText extends PrimitiveInstance {
    attributes: ITextAttr = {} as ITextAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.TEXT;
    defaultConfig: ITextAttrConfig = attrConfig['text'];
    box: Box = new Box(this.type);
    editing = false;

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
                this.attributes = (config.attributes as ITextAttr) ?? this.attributes;
            }
        }
        this.box.setBox(this.attributes.x, this.attributes.y, this.attributes.width, this.attributes.height);
    }

    setContent(content: string): void {
        this.attributes.content = content;
    }

    setEditing(editing: boolean) {
        this.editing = editing;
    }
}
