import type {IPrimitiveInstance} from '../types';
import {type IPrimitive, PrimitiveTypeAllEnum} from '../types';
import {PrimitiveInstanceSvg} from './instance-primitive-svg.class';
import {PrimitiveInstanceText} from './instance-primitive-text.class';
import {PrimitiveInstanceSvgRect} from './instance-primitive-svg-rect.class';
import {PrimitiveInstanceImage} from './instance-primitive-image.class';
import {PrimitiveInstanceSvgLine} from './instance-primitive-svg-line.class';
import {PrimitiveInstanceSvgEllipse} from './instance-primitive-svg-ellipse.class';
import type {PrimitiveInstance} from './instance-primitive.class';
import {throwError} from '../functions';
import type {Layer} from './layer.class';

export class PrimitiveInstanceFactory {
    static primitiveMap = {
        [PrimitiveTypeAllEnum.SVG]: PrimitiveInstanceSvg,
        [PrimitiveTypeAllEnum.TEXT]: PrimitiveInstanceText,
        [PrimitiveTypeAllEnum.RECT]: PrimitiveInstanceSvgRect,
        [PrimitiveTypeAllEnum.IMAGE]: PrimitiveInstanceImage,
        [PrimitiveTypeAllEnum.LINE]: PrimitiveInstanceSvgLine,
        [PrimitiveTypeAllEnum.ELLIPSE]: PrimitiveInstanceSvgEllipse,
    };

    static getInstance(config: IPrimitive | IPrimitiveInstance, layer?: Layer, name?: string): PrimitiveInstance {
        if (config.type in this.primitiveMap) {
            const primitiveClass = this.primitiveMap[config.type];
            return new primitiveClass(config, layer, name);
        }
        throwError('PrimitiveFactory', `Primitive type ${config.type} is invalid`);
    }
}
