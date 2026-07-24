import type {IPrimitive} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import {PrimitiveSvg} from './primitive-svg.class';
import {PrimitiveText} from './primitive-text.class';
import {PrimitiveSvgRect} from './primitive-svg-rect.class';
import {PrimitiveImage} from './primitive-image.class';
import {PrimitiveSvgLine} from './primitive-svg-line.class';
import {PrimitiveSvgEllipse} from './primitive-svg-ellipse.class';
import type {Primitive} from './primitive.class';
import {throwError} from '../functions';

export class PrimitiveFactory {
    static primitiveMap = {
        [PrimitiveTypeAllEnum.SVG]: PrimitiveSvg,
        [PrimitiveTypeAllEnum.TEXT]: PrimitiveText,
        [PrimitiveTypeAllEnum.RECT]: PrimitiveSvgRect,
        [PrimitiveTypeAllEnum.IMAGE]: PrimitiveImage,
        [PrimitiveTypeAllEnum.LINE]: PrimitiveSvgLine,
        [PrimitiveTypeAllEnum.ELLIPSE]: PrimitiveSvgEllipse,
    };

    static getInstance(config: IPrimitive): Primitive {
        if (config.type in this.primitiveMap) {
            const primitiveClass = this.primitiveMap[config.type];
            return new primitiveClass(config);
        }
        throwError('PrimitiveFactory', `Primitive type ${config.type} is invalid`);
    }
}
