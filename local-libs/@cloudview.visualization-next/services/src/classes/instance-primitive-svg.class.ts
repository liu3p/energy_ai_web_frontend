import {PrimitiveEventEnum, PrimitiveInstance} from './instance-primitive.class';
import type {
    IBindingValue,
    IPrimitive,
    IPrimitiveInstance,
    IStatus,
    IStatusInfo,
    ISvgAttr,
    ISvgAttrConfig,
} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import {attrConfig} from '../configs';
import {SvgUtils} from '../tools';
import {throwError} from '../functions';
import {Box} from './box.class';
import type {Layer} from './layer.class';

export class PrimitiveInstanceSvg extends PrimitiveInstance {
    attributes: ISvgAttr = {} as ISvgAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.SVG;
    defaultConfig: ISvgAttrConfig = attrConfig.svg;
    box: Box = new Box(this.type);
    status: IStatus = {};
    model?: string;
    parsedStatus = false;
    _statusList: IStatusInfo[] = [];

    assignConfig(config?: IPrimitiveInstance | null) {
        this._assignConfig(config);
        this.status = config?.status ?? this.status;
    }

    constructor(config?: IPrimitive | IPrimitiveInstance | null, layer?: Layer, name?: string) {
        super(config, layer, name);
        if (config) {
            if ('content' in config) {
                this.status = config.content?.status ?? this.status;
                this.attributes = config.content?.attributes
                    ? JSON.parse(JSON.stringify(config.content.attributes))
                    : this.attributes;
            } else {
                config = config as IPrimitiveInstance;
                this.status = config.status ?? this.status;
                this.attributes = (config.attributes as ISvgAttr) ?? this.attributes;
            }
            this.model = config.model ?? this.model;
        }
        this.box.setBox(this.attributes.x, this.attributes.y, this.attributes.width, this.attributes.height);
    }

    setModel(model: string) {
        this.model = model;
    }

    get statusList() {
        if (!this.model) {
            throwError('PrimitiveInstanceSvg', 'ParseStatus: model is null');
        }
        if (!this.parsedStatus) {
            const nodeData = SvgUtils.parse(this.model);
            this._statusList = SvgUtils.getStatusList(nodeData);
            this.parsedStatus = true;
        }
        return this._statusList;
    }

    getConfig(): IPrimitiveInstance {
        return {
            ...super.getConfig(),
            status: this.status,
        };
    }

    setStatus(key: string, value: IBindingValue): void {
        key = String(Number(key));
        if (this.status[key] !== value) {
            this.status[key] = value;
            this.dispatch(key, {key, value});
            this.dispatch(PrimitiveEventEnum.ATTR_CHANGE, {key, value});
        }
    }

    getStatus(key: string): IBindingValue {
        key = String(Number(key));
        return this.status[key] as IBindingValue;
    }
}
