import {PrimitiveInstance} from './instance-primitive.class';
import type {IEllipseAttr, IEllipseAttrConfig, IPrimitive, IPrimitiveInstance} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import {attrConfig} from '../configs';
import {Box} from './box.class';
import {watch} from 'vue';
import type {Layer} from './layer.class';
import {Utils} from '../tools';

export class PrimitiveInstanceSvgEllipse extends PrimitiveInstance {
    attributes: IEllipseAttr = {} as IEllipseAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.ELLIPSE;
    defaultConfig: IEllipseAttrConfig = attrConfig['svg-ellipse'];

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
                this.attributes = (config.attributes as IEllipseAttr) ?? this.attributes;
            }
        }
        this.box.setBox(this.attributes.cx, this.attributes.cy, this.attributes.rx, this.attributes.ry);
    }

    setPosition(x: number, y: number): void {
        this.attributes.cx = Utils.formatDecimal(x + this.attributes.rx);
        this.attributes.cy = Utils.formatDecimal(y + this.attributes.ry);
        this.box.setPosition(this.attributes.cx, this.attributes.cy);
    }

    setSize(width: number, height: number): void {
        this.attributes.rx = Utils.formatDecimal(width / 2);
        this.attributes.ry = Utils.formatDecimal(height / 2);
    }

    setPositionWatch() {
        this.cancelPositionWatch = watch(
            () => [this.attributes.cx, this.attributes.cy],
            () => {
                this.box.setPosition(this.attributes.cx, this.attributes.cy);
            },
            {immediate: true}
        );
    }

    setSizeWatch() {
        this.cancelSizeWatch = watch(
            () => [this.attributes.rx, this.attributes.ry],
            () => {
                this.box.setSize(this.attributes.rx, this.attributes.ry, this.attributes.cx, this.attributes.cy);
            },
            {immediate: true}
        );
    }

    // in(x1: number, y1: number, x2: number, y2: number): boolean {
    //     return (
    //         x1 <= this.attributes.cx - this.attributes.rx &&
    //         y1 <= this.attributes.cy - this.attributes.ry &&
    //         x2 >= this.attributes.cx + this.attributes.rx &&
    //         y2 >= this.attributes.cy + this.attributes.ry
    //     );
    // }

    getCenter(): {centerY: number; centerX: number} {
        return {
            centerX: this.attributes.cx,
            centerY: this.attributes.cy,
        };
    }

    getFlip(): {scaleX: number; scaleY: number; translateX: number; translateY: number} {
        return {
            scaleX: this.attributes['horizontal-flip'] ? -1 : 1,
            scaleY: this.attributes['vertical-flip'] ? -1 : 1,
            translateX: this.attributes['horizontal-flip'] ? -(this.attributes.cx * 2) : 0,
            translateY: this.attributes['vertical-flip'] ? -(this.attributes.cy * 2) : 0,
        };
    }

    getMinX() {
        return this.attributes.cx - this.attributes.rx - this.attributes['stroke-width'] / 2;
    }

    getMinY() {
        return this.attributes.cy - this.attributes.ry - this.attributes['stroke-width'] / 2;
    }

    getMaxX() {
        return this.attributes.cx + this.attributes.rx + this.attributes['stroke-width'] / 2;
    }

    getMaxY() {
        return this.attributes.cy + this.attributes.ry + this.attributes['stroke-width'] / 2;
    }

    getPosition() {
        return {
            x: this.attributes.cx - this.attributes.rx,
            y: this.attributes.cy - this.attributes.ry,
        };
    }

    getBoundRect(): {width: number; height: number} {
        return {
            width: this.attributes.rx * 2,
            height: this.attributes.ry * 2,
        };
    }

    setBox(x: number, y: number, width: number, height: number): void {
        this.attributes.cx = Utils.formatDecimal(x + width / 2);
        this.attributes.cy = Utils.formatDecimal(y + height / 2);
        this.attributes.rx = Utils.formatDecimal(width / 2);
        this.attributes.ry = Utils.formatDecimal(height / 2);
        this.box.setBox(this.attributes.cx, this.attributes.cy, this.attributes.rx, this.attributes.ry);
    }

    getMinMax() {
        const reverseTheta = this.getReverseTheta();
        const leftTop = Utils.getRotateAnglePos(
            this.attributes.cx - this.attributes.rx - this.attributes['stroke-width'] / 2,
            this.attributes.cy - this.attributes.ry - this.attributes['stroke-width'] / 2,
            reverseTheta,
            this.attributes.cx,
            this.attributes.cy
        );
        const rightTop = Utils.getRotateAnglePos(
            this.attributes.cx + this.attributes.rx + this.attributes['stroke-width'] / 2,
            this.attributes.cy - this.attributes.ry - this.attributes['stroke-width'] / 2,
            reverseTheta,
            this.attributes.cx,
            this.attributes.cy
        );
        const leftBottom = Utils.getRotateAnglePos(
            this.attributes.cx - this.attributes.rx - this.attributes['stroke-width'] / 2,
            this.attributes.cy + this.attributes.ry + this.attributes['stroke-width'] / 2,
            reverseTheta,
            this.attributes.cx,
            this.attributes.cy
        );
        const rightBottom = Utils.getRotateAnglePos(
            this.attributes.cx + this.attributes.rx + this.attributes['stroke-width'] / 2,
            this.attributes.cy + this.attributes.ry + this.attributes['stroke-width'] / 2,
            reverseTheta,
            this.attributes.cx,
            this.attributes.cy
        );
        return {
            minX: Math.min(leftTop.x, rightTop.x, leftBottom.x, rightBottom.x),
            minY: Math.min(leftTop.y, rightTop.y, leftBottom.y, rightBottom.y),
            maxX: Math.max(leftTop.x, rightTop.x, leftBottom.x, rightBottom.x),
            maxY: Math.max(leftTop.y, rightTop.y, leftBottom.y, rightBottom.y),
        };
    }
}
