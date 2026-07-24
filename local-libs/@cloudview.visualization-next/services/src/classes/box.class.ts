import type {IBox, ILinePosition, IRectBox} from '../types';
import {PrimitiveTypeAllEnum} from '../types';

export class Box {
    box: IBox;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.SVG;

    constructor(type, box?: IBox | null) {
        this.type = type;
        this.box =
            box ?? this.type === PrimitiveTypeAllEnum.LINE
                ? {x: 0, y: 0, posList: []}
                : {
                      x: 0,
                      y: 0,
                      width: 0,
                      height: 0,
                  };
    }

    setBox(x: number, y: number, posList: ILinePosition[]);
    setBox(cx: number, cy: number, rx: number, ry: number): void;
    setBox(x: number, y: number, width: number | ILinePosition[], height?: number) {
        if (this.type === PrimitiveTypeAllEnum.ELLIPSE) {
            width = width as number;
            height = height as number;
            this.box = {
                x: x - width,
                y: y - height,
                width: 2 * width,
                height: 2 * height,
            };
        } else if (this.type === PrimitiveTypeAllEnum.LINE) {
            this.box = {
                x: x,
                y: y,
                posList: width as ILinePosition[],
            };
        } else {
            this.box = {
                x,
                y,
                width: width as number,
                height: height as number,
            };
        }
    }

    setPosition(cx: number, cy: number): void;
    setPosition(x: number, y: number) {
        if (this.type === PrimitiveTypeAllEnum.LINE) {
            this.box = Object.assign(this.box, {x, y});
        } else if (this.type === PrimitiveTypeAllEnum.ELLIPSE) {
            this.box = Object.assign(this.box, {
                x: x - (this.box as IRectBox).width / 2,
                y: y - (this.box as IRectBox).height / 2,
            });
        } else {
            this.box = Object.assign(this.box, {x: x, y: y});
        }
    }

    setSize(width: number, height: number, x?: number, y?: number);
    setSize(rx: number, ry: number, cx?: number, cy?: number);
    setSize(x: number, y: number, x2?: number | ILinePosition, y2?: number) {
        if (this.type === PrimitiveTypeAllEnum.LINE) {
            this.box = Object.assign(this.box, {x, y, x2});
        } else if (this.type === PrimitiveTypeAllEnum.ELLIPSE) {
            this.box = Object.assign(this.box, {
                x: (x2 as number) - x,
                y: y2! - y,
                width: 2 * x,
                height: 2 * y,
            });
        } else {
            this.box = Object.assign(this.box, {width: x, height: y});
        }
    }

    getBox(): IBox {
        return this.box;
    }
}
