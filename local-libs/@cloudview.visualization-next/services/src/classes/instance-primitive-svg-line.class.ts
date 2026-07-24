import {PrimitiveInstance} from './instance-primitive.class';
import type {ILineAttr, ILineAttrConfig, ILinePosition, IPrimitive, IPrimitiveInstance} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import {attrConfig, BasicLine} from '../configs';
import {Box} from './box.class';
import type {Layer} from './layer.class';
import {watch} from 'vue';
import {LinePathType, Utils} from '@cloudview.visualization-next/services';

export class PrimitiveInstanceSvgLine extends PrimitiveInstance {
    attributes: ILineAttr = {} as ILineAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.LINE;
    defaultConfig: ILineAttrConfig = attrConfig['svg-line'];
    box: Box = new Box(this.type);

    assignConfig(config?: IPrimitiveInstance | null) {
        this._assignConfig(config);
    }

    constructor(config?: IPrimitive | IPrimitiveInstance | null, layer?: Layer, name?: string) {
        super(config, layer, name);
        if (config) {
            let attributes;
            if ('content' in config) {
                this.attributes = config.content?.attributes
                    ? JSON.parse(JSON.stringify(config.content.attributes))
                    : this.attributes;
                attributes = this.attributes;
            } else {
                config = config as IPrimitiveInstance;
                this.attributes = (config.attributes as ILineAttr) ?? this.attributes;
                attributes = this.attributes;
            }
            if (!('x' in attributes)) {
                this.attributes.x = Utils.formatDecimal(attributes.x1);
                this.attributes.y = Utils.formatDecimal(attributes.y1);
                this.attributes.posList = [
                    {
                        x: Utils.formatDecimal(attributes.x2),
                        y: Utils.formatDecimal(attributes.y2),
                        type: LinePathType.L,
                    },
                ];
                this.attributes['background-width'] = BasicLine.content!.attributes['background-width'];
                this.attributes['background-opacity'] = BasicLine.content!.attributes['background-opacity'];
                this.attributes['background-color'] = BasicLine.content!.attributes['background-color'];
                this.attributes['background-visible'] = BasicLine.content!.attributes['background-visible'];
                delete attributes.x1;
                delete attributes.y1;
                delete attributes.x2;
                delete attributes.y2;
            }
            this.formatDecimalPosList();
        }
        this.box.setBox(this.attributes.x, this.attributes.y, this.attributes.posList);
    }

    formatDecimalPosList() {
        this.attributes.posList.forEach(item => {
            item.x = Utils.formatDecimal(item.x);
            item.y = Utils.formatDecimal(item.y);
        });
    }

    setPositionWatch() {
        this.cancelPositionWatch = watch(
            () => [this.attributes.x, this.attributes.y],
            (newVal, oldVal) => {
                if (newVal && oldVal && (newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1])) {
                    this.setPositionD(oldVal[0] - newVal[0], oldVal[1] - newVal[1]);
                }
                this.box.setPosition(this.attributes.x, this.attributes.y);
            },
            {immediate: true}
        );
    }

    setSizeWatch() {
        this.cancelSizeWatch = watch(
            () => [this.attributes.x, this.attributes.y, this.attributes.posList],
            () => {
                this.box.setBox(this.attributes.x, this.attributes.y, this.attributes.posList);
            },
            {immediate: true, deep: true}
        );
    }

    // in(x1: number, y1: number, x2: number, y2: number): boolean {
    //     return (
    //         x1 <= this.attributes.x1 && x2 >= this.attributes.x2 && y1 <= this.attributes.y1 && y2 >= this.attributes.y2
    //     );
    // }

    getMinX() {
        const minX = Math.min(...this.attributes.posList.map(item => item.x));
        return Math.min(this.attributes.x, minX);
    }

    getMinY() {
        const minY = Math.min(...this.attributes.posList.map(item => item.y));
        return (
            Math.min(this.attributes.y, minY) -
            Math.max(this.attributes['stroke-width'] / 2, this.attributes['background-width'] / 2)
        );
    }

    getMaxX() {
        const maxX = Math.max(...this.attributes.posList.map(item => item.x));
        return Math.max(this.attributes.x, maxX);
    }

    getMaxY() {
        const maxY = Math.max(...this.attributes.posList.map(item => item.y));
        return (
            Math.max(this.attributes.y, maxY) +
            Math.max(this.attributes['stroke-width'] / 2, this.attributes['background-width'] / 2)
        );
    }

    getBoundRect(): {width: number; height: number} {
        return {
            width: this.getMaxX() - this.getMinX(),
            height: this.getMaxY() - this.getMinY(),
        };
    }

    setBox(x: number, y: number, posList: number | ILinePosition[]): void {
        // this.attributes.x = Utils.formatDecimal(x);
        // this.attributes.y = Utils.formatDecimal(y);
        // this.attributes.posList = posList as ILinePosition[];
        // this.box.setBox(this.attributes.x, this.attributes.y, this.attributes.posList);
        this.box.setBox(x, y, posList as ILinePosition[]);
    }

    getMinMax(): {minX: number; minY: number; maxX: number; maxY: number} {
        return {
            minX: this.getMinX(),
            minY: this.getMinY(),
            maxX: this.getMaxX(),
            maxY: this.getMaxY(),
        };
    }

    getCenter() {
        return {
            centerX: (this.getMaxX() + this.getMinX()) / 2,
            centerY: (this.getMaxY() + this.getMinY()) / 2,
        };
    }

    setPositionD(dx: number, dy: number) {
        this.attributes.posList.forEach(item => {
            item.x = Utils.formatDecimal(item.x - dx);
            item.y = Utils.formatDecimal(item.y - dy);
        });
    }

    setSize(x: number, y: number, posList?: ILinePosition[]) {
        this.cancelPositionWatch();
        this.attributes.x = Utils.formatDecimal(x);
        this.attributes.y = Utils.formatDecimal(y);
        this.attributes.posList = posList!;
        this.formatDecimalPosList();
        this.setPositionWatch();
    }

    deleteStartPoint() {
        this.cancelPositionWatch();
        const posList = [...this.attributes.posList];
        const secondPoint = posList.shift();
        this.attributes.x = secondPoint!.x;
        this.attributes.y = secondPoint!.y;
        this.attributes.posList = posList;
        this.setPositionWatch();
    }

    deleteOtherPoint(index) {
        const posList = [...this.attributes.posList];
        posList.splice(index, 1);
        this.attributes.posList = posList;
    }

    setRotate(rotate: number) {
        this.cancelPositionWatch();
        const center = this.getCenter();
        const theta = 2 * Math.PI - (Utils.getRealRotate(rotate) / 180) * Math.PI;
        const position = Utils.getRotateAnglePos(
            this.attributes.x,
            this.attributes.y,
            theta,
            center.centerX,
            center.centerY
        );
        this.attributes.x = Utils.formatDecimal(position.x);
        this.attributes.y = Utils.formatDecimal(position.y);
        this.attributes.posList.forEach(item => {
            const position = Utils.getRotateAnglePos(item.x, item.y, theta, center.centerX, center.centerY);
            item.x = Utils.formatDecimal(position.x);
            item.y = Utils.formatDecimal(position.y);
        });
        this.setBox(this.attributes.x, this.attributes.y, this.attributes.posList);
        this.setPositionWatch();
    }

    setRotateBox(rotate) {
        const center = this.getCenter();
        const theta = 2 * Math.PI - (Utils.getRealRotate(rotate) / 180) * Math.PI;
        const position = Utils.getRotateAnglePos(
            this.attributes.x,
            this.attributes.y,
            theta,
            center.centerX,
            center.centerY
        );
        const posList = this.attributes.posList.map(item => {
            const position = Utils.getRotateAnglePos(item.x, item.y, theta, center.centerX, center.centerY);
            return {
                x: Utils.formatDecimal(position.x),
                y: Utils.formatDecimal(position.y),
                type: item.type,
            };
        });
        this.setBox(Utils.formatDecimal(position.x), Utils.formatDecimal(position.y), posList);
    }
}
