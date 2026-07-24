import type {IAttributes, IPrimitive, IPrimitiveAttrConfig, IStatus, IUserDefined} from '../types';
import {EngineTypeEnum, PrimitiveTypeAllEnum} from '../types';

export abstract class Primitive implements IPrimitive {
    description = '';
    enabled = true;
    engine_type: EngineTypeEnum = EngineTypeEnum['2D'];
    id = '';
    model = '';
    model_id = '';
    name = '';
    vnb_id = '';
    public = true;
    tag = '';
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.SVG;
    isBasic = false;
    attributes: IAttributes | null = null;
    status: IStatus = {};
    userDefined: IUserDefined = {};
    defaultConfig: IPrimitiveAttrConfig | null = null;

    protected constructor(config?: IPrimitive | null) {
        this._assignConfig(config);
    }

    protected _genAttributes<T>(): T {
        const attributes = {};
        for (const key in this.defaultConfig) {
            if (!this.defaultConfig[key].hiddenInPrimitive) {
                attributes[key] = this.defaultConfig[key].value;
            }
        }
        return attributes as T;
    }

    protected _assignConfig(config: IPrimitive | null | undefined) {
        this.description = config?.description.trim() ?? this.description;
        this.enabled = config?.enabled ?? this.enabled;
        this.engine_type = config?.engine_type ?? this.engine_type;
        this.id = config?.id ?? this.id;
        this.model_id = config?.model_id ?? this.model_id;
        this.name = config?.name ?? this.name;
        this.vnb_id = config?.vnb_id ?? this.vnb_id;
        this.public = config?.public ?? this.public;
        this.tag = config?.tag.trim() ?? this.tag;
        this.type = config?.type ?? this.type;
        this.userDefined = config?.content?.userDefined ?? this.userDefined;
    }

    abstract setPosition(x: number, y: number): void;

    setModel(model: string) {
        this.model = model;
    }

    getConfig(): IPrimitive {
        const attributes: IAttributes = {} as IAttributes;
        for (const key in this.attributes) {
            if (key !== 'x' && key !== 'y') {
                attributes[key] = this.attributes[key];
            }
        }
        return {
            id: this.id,
            name: this.name,
            model_id: this.model_id,
            engine_type: this.engine_type,
            enabled: this.enabled,
            description: this.description,
            vnb_id: this.vnb_id,
            public: this.public,
            tag: this.tag,
            type: this.type as PrimitiveTypeAllEnum,
            isBasic: this.isBasic,
            content: {
                attributes,
                userDefined: this.userDefined,
                status: this.status,
            },
        };
    }

    setConfig(config: IPrimitive) {
        this._assignConfig(config);
    }
}
