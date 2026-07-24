import type {
    IAttributes,
    IBindingDialog,
    IBindingPopover,
    IPrimitive,
    IPrimitiveBindings,
    IPrimitiveDevice,
    IPrimitiveInstance,
    IRectAttr,
    ISvgAttr,
    IUserDefined,
    IWithDeviceBinding,
} from '../types';
import {DataBindingTypeEnum, type IBindingValue, type IPrimitiveAttrConfig, PrimitiveTypeAllEnum} from '../types';
import {IdUtils, Utils} from '../tools';
import {Box} from './box.class';
import {watch} from 'vue';
import {InsertBindingsKey, statusPrefix} from '../tokens/constants';
import {Observer} from './observer.class';
import {PlayerError} from './player-error.class';
import type {Layer} from './layer.class';
import {decodeInsertBinding, encodeInsertBinding} from '@cloudview.visualization-next/services';

export enum PrimitiveEventEnum {
    ATTR_CHANGE = 'attrChange',
}

export abstract class PrimitiveInstance extends Observer implements IPrimitiveInstance {
    // 从IPrimitiveInstance实现的属性
    attributes: IAttributes = {} as IAttributes;
    baseId = '';
    bindings: IPrimitiveBindings = {};
    devices: IPrimitiveDevice[] = [];
    id = '';
    invisible = false;
    isBasic = false;
    layerId = '';
    layer?: Layer;
    locked = false;
    name = '';
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.SVG;
    userDefined: IUserDefined = {};
    defaultConfig: IPrimitiveAttrConfig = {} as IPrimitiveAttrConfig;
    hasBindingError?: boolean = false;
    modelId = '';
    eventDict: Record<string, (...args: any[]) => void> = {};

    // 自有的属性
    selected = false;
    box: Box = new Box(this.type);
    positionWatchCancelHandler?: () => void;
    sizeWatchCancelHandler?: () => void;

    protected _assignConfig(config: IPrimitiveInstance | IPrimitive | null | undefined, layer?: Layer, name?: string) {
        if (config) {
            if ('content' in config) {
                config = config as IPrimitive;
                this.id = IdUtils.genPrimitiveId();
                this.baseId = config.id ?? this.baseId;
                this.layer = layer ?? this.layer;
                this.layerId = this.layer?.id ?? this.layerId;
                this.modelId = config.model_id ?? this.modelId;
                this.name = name ?? this.name;
                this.isBasic = config.isBasic;
                this.type = config.type;
                this.userDefined = config.content?.userDefined ?? this.userDefined;
            } else {
                config = config as IPrimitiveInstance;
                this.id = config.id ?? IdUtils.genPrimitiveId();
                this.baseId = config.baseId;
                this.modelId = config.modelId ?? this.modelId;
                this.layer = config.layer ?? layer ?? this.layer;
                this.layerId = config.layerId;
                this.name = config.name;
                this.isBasic = config.isBasic;
                this.type = config.type;
                this.userDefined = config.userDefined;
                this.invisible = config.invisible ?? this.invisible;
                this.locked = config.locked ?? this.locked;
                this.bindings = config.bindings;
                this.devices = config.devices;
            }
        }
    }

    flatAttrsAndBindingsForPlayer() {
        // 扁平化用户自定义属性
        Object.keys(this.userDefined).forEach(key => {
            return (this.attributes[key] = this.userDefined[key].value);
        });

        // 扁平化数据绑定
        Object.values(this.bindings).forEach(value => {
            if (Reflect.has(value, InsertBindingsKey)) {
                Object.assign(this.bindings, value[InsertBindingsKey]);
                // 将每个插值绑定到总属性组上面
                Object.keys(value[InsertBindingsKey]).forEach(key => {
                    this.attributes[key] = '';
                });
            }
        });
    }

    protected constructor(config?: IPrimitiveInstance | IPrimitive | null, layer?: Layer, name?: string) {
        super();
        this._assignConfig(config, layer, name);
    }

    setPosition(x: number, y: number): void {
        const attributes = this.attributes as ISvgAttr;
        attributes.x = Utils.formatDecimal(x);
        attributes.y = Utils.formatDecimal(y);
        this.box.setPosition(attributes.x, attributes.y);
    }

    setPositionWatch() {
        this.positionWatchCancelHandler = watch(
            () => [(this.attributes as ISvgAttr).x, (this.attributes as ISvgAttr).y],
            () => {
                this.box.setPosition((this.attributes as ISvgAttr).x, (this.attributes as ISvgAttr).y);
            },
            {immediate: true}
        );
    }

    setSizeWatch() {
        this.sizeWatchCancelHandler = watch(
            () => [(this.attributes as ISvgAttr).width, (this.attributes as ISvgAttr).height],
            () => {
                this.box.setSize((this.attributes as ISvgAttr).width, (this.attributes as ISvgAttr).height);
            },
            {immediate: true}
        );
    }

    cancelPositionWatch() {
        this.positionWatchCancelHandler?.();
    }

    cancelSizeWatch() {
        this.sizeWatchCancelHandler?.();
    }

    setSelected(selected: boolean, needWatch = true): void {
        this.selected = selected;
        if (this.selected && needWatch) {
            this.setPositionWatch();
            this.setSizeWatch();
        } else {
            this.cancelPositionWatch();
            this.cancelSizeWatch();
        }
    }

    setStatus(key: string, value: IBindingValue): void {
        throw new PlayerError(`图元属性"${key}"不存在`, 'vis.player.unFoundPrimitiveAttribute', {key: key});
    }

    setAttribute(key: string, value: IBindingValue) {
        if (Reflect.has(this.attributes, key)) {
            if (this.attributes[key] !== value) {
                this.attributes[key] = value;
                this.dispatch(key, {key, value});
                this.dispatch(PrimitiveEventEnum.ATTR_CHANGE, {key, value});
            }
        } else if (key.startsWith(statusPrefix)) {
            this.setStatus(key.substring(statusPrefix.length, key.length), value);
        } else {
            throw new PlayerError(`图元属性"${key}"不存在`, 'vis.player.unFoundPrimitiveAttribute', {key: key});
        }
    }

    getStatus(key: string): IBindingValue {
        throw new PlayerError(`图元属性"${key}"不存在`, 'vis.player.unFoundPrimitiveAttribute', {key: key});
    }

    getAttribute(key: string): IBindingValue {
        if (Reflect.has(this.attributes, key)) {
            return this.attributes[key] as IBindingValue;
        } else if (key.startsWith(statusPrefix)) {
            return this.getStatus(key.substring(statusPrefix.length, key.length));
        } else {
            throw new PlayerError(`图元属性"${key}"不存在`, 'vis.player.unFoundPrimitiveAttribute', {key: key});
        }
    }

    bindEvent(eventName: string, value: (event: Event, eventTarget: HTMLElement) => void): void {
        this.eventDict[eventName] = value;
    }

    in(x1: number, y1: number, x2: number, y2: number): boolean {
        const minMax = this.getMinMax();
        return x1 <= minMax.minX && y1 <= minMax.minY && x2 >= minMax.maxX && y2 >= minMax.maxY;
    }

    getConfig(): IPrimitiveInstance {
        return {
            id: this.id,
            name: this.name,
            baseId: this.baseId,
            modelId: this.modelId,
            layerId: this.layerId,
            type: this.type as PrimitiveTypeAllEnum,
            devices: this.devices,
            isBasic: this.isBasic,
            attributes: this.attributes!,
            userDefined: this.userDefined,
            bindings: this.bindings,
            locked: this.locked,
            invisible: this.invisible,
        };
    }

    getCenter(): {centerY: number; centerX: number} {
        const attributes = this.attributes as ISvgAttr;
        return {
            centerX: attributes.x + attributes.width / 2,
            centerY: attributes.y + attributes.height / 2,
        };
    }

    getFlip(): {scaleX: number; scaleY: number; translateX: number; translateY: number} {
        const attributes = this.attributes as ISvgAttr;
        return {
            scaleX: attributes['horizontal-flip'] ? -1 : 1,
            scaleY: attributes['vertical-flip'] ? -1 : 1,
            translateX: attributes['horizontal-flip'] ? -(attributes.x * 2 + attributes.width) : 0,
            translateY: attributes['vertical-flip'] ? -(attributes.y * 2 + attributes.height) : 0,
        };
    }

    // 更新数据绑定中设备
    updateBindingConfigDevice(device: IPrimitiveDevice) {
        const withDeviceBinding = [
            DataBindingTypeEnum.TELEMETRY,
            DataBindingTypeEnum.TELEINDICATION,
            DataBindingTypeEnum.TELEADJUST,
            DataBindingTypeEnum.TELECONTROL,
            DataBindingTypeEnum.TELEPULSE,
            DataBindingTypeEnum.DEVICE_PROP,
            DataBindingTypeEnum.DEVICE_INFO,
            DataBindingTypeEnum.DEVICE_STATE,
            DataBindingTypeEnum.CUSTOM_DATA,
            DataBindingTypeEnum.CUSTOM_SUBSCRIPTION,
            DataBindingTypeEnum.CUSTOM_ACTION,
            DataBindingTypeEnum.CUSTOM_COMPONENT,
        ];
        Object.values(this.bindings).forEach(item => {
            if (withDeviceBinding.includes(item.type)) {
                const binding = item as IWithDeviceBinding;
                if (binding.deviceId) {
                    binding.deviceId = device.id;
                    binding.deviceSn = device.sn;
                }
            } else if (item.type === DataBindingTypeEnum.POPOVER || item.type === DataBindingTypeEnum.DIALOG) {
                const binding = item as IBindingPopover | IBindingDialog;
                if (binding.insertBindings) {
                    Object.values(binding.insertBindings).forEach(insertItem => {
                        const insertBinding = insertItem as IWithDeviceBinding;
                        if (insertBinding.deviceId) {
                            insertBinding.deviceId = device.id;
                            insertBinding.deviceSn = device.sn;
                        }
                    });
                    binding.content = binding.content.replaceAll(/data-binding="([^"]+)"/g, (...args) => {
                        const strBinding = decodeInsertBinding(args[1]);
                        if (Reflect.has(strBinding, 'deviceId')) {
                            (strBinding as IWithDeviceBinding).deviceId = device.id;
                            (strBinding as IWithDeviceBinding).deviceSn = device.sn;
                        }
                        return `data-binding="${encodeInsertBinding(strBinding)}"`;
                    });
                }
            }
        });
    }

    setSize(width: number, height: number, other?: any) {
        const attributes = this.attributes as ISvgAttr;
        attributes.width = Utils.formatDecimal(width);
        attributes.height = Utils.formatDecimal(height);
        this.box.setSize(attributes.width, attributes.height);
    }

    getMinX() {
        const attributes = this.attributes as ISvgAttr;
        return attributes.x;
    }

    getMinY() {
        const attributes = this.attributes as ISvgAttr;
        return attributes.y;
    }

    getMaxX() {
        const attributes = this.attributes as ISvgAttr;
        return attributes.x + attributes.width;
    }

    getMaxY() {
        const attributes = this.attributes as ISvgAttr;
        return attributes.y + attributes.height;
    }

    getReverseTheta() {
        const rotate = Utils.getRealRotate(this.attributes.rotate);
        const theta = (rotate * Math.PI) / 180;
        return 2 * Math.PI - theta;
    }

    getMinMax() {
        const attributes = this.attributes as IRectAttr;
        const reverseTheta = this.getReverseTheta();
        const strokeWidth = attributes['stroke-width'] || 0;
        const {centerX, centerY} = this.getCenter();
        const leftTop = Utils.getRotateAnglePos(
            attributes.x - strokeWidth / 2,
            attributes.y - strokeWidth / 2,
            reverseTheta,
            centerX,
            centerY
        );
        const rightTop = Utils.getRotateAnglePos(
            attributes.x + attributes.width + strokeWidth / 2,
            attributes.y - strokeWidth / 2,
            reverseTheta,
            centerX,
            centerY
        );
        const leftBottom = Utils.getRotateAnglePos(
            attributes.x - strokeWidth / 2,
            attributes.y + attributes.height + strokeWidth / 2,
            reverseTheta,
            centerX,
            centerY
        );
        const rightBottom = Utils.getRotateAnglePos(
            attributes.x + attributes.width + strokeWidth / 2,
            attributes.y + attributes.height + strokeWidth / 2,
            reverseTheta,
            centerX,
            centerY
        );
        return {
            minX: Math.min(leftTop.x, rightTop.x, leftBottom.x, rightBottom.x),
            minY: Math.min(leftTop.y, rightTop.y, leftBottom.y, rightBottom.y),
            maxX: Math.max(leftTop.x, rightTop.x, leftBottom.x, rightBottom.x),
            maxY: Math.max(leftTop.y, rightTop.y, leftBottom.y, rightBottom.y),
        };
    }

    getPosition() {
        const attributes = this.attributes as ISvgAttr;
        return {
            x: attributes.x,
            y: attributes.y,
        };
    }

    getBoundRect() {
        const attributes = this.attributes as ISvgAttr;
        return {
            width: attributes.width,
            height: attributes.height,
        };
    }

    setBox(x: number, y: number, width: number, height?: number) {
        this.setSize(width, height!);
        this.setPosition(x, y);
    }

    setInvisible(invisible: boolean) {
        this.invisible = invisible;
    }

    setLocked(locked: boolean) {
        this.locked = locked;
    }

    setRotate(rotate: number) {
        this.attributes.rotate = rotate;
    }

    setModel(model: string) {
        return;
    }

    setDevices(devices: IPrimitiveDevice[]) {
        this.devices = devices;
    }
}
