import type {IPrimitive, IStatusInfo, ISvgAttr, ISvgAttrConfig} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import attrConfig from '../configs/attr.config';
import {Primitive} from './primitive.class';
import {SvgUtils} from '../tools';
import {throwError} from '../functions';

export class PrimitiveSvg extends Primitive {
    attributes: ISvgAttr;
    type: PrimitiveTypeAllEnum = PrimitiveTypeAllEnum.SVG;
    defaultConfig: ISvgAttrConfig = attrConfig.svg;
    parsedStatus = false;
    _statusList: IStatusInfo[] = [];

    constructor(config?: IPrimitive | null) {
        super(config);
        if (config?.content?.attributes) {
            this.attributes = config?.content?.attributes as ISvgAttr;
        } else {
            this.attributes = this._genAttributes();
            this.attributes['statusMutualExclusion'] = true;
        }
        this.status = config?.content?.status ?? this.status;
    }

    setPosition(x: number, y: number): void {
        this.attributes.x = x;
        this.attributes.y = y;
    }

    parseStatus() {
        const nodeData = SvgUtils.parse(this.model);
        const statusList = SvgUtils.getStatusList(nodeData);

        this.status = {...statusList.map(item => item.index === 0)};
    }

    get statusList() {
        if (!this.model) {
            throwError('PrimitiveSvg', 'ParseStatus: model is null');
        }
        if (!this.parsedStatus) {
            const nodeData = SvgUtils.parse(this.model);
            this._statusList = SvgUtils.getStatusList(nodeData);
            this.parsedStatus = true;
        }
        return this._statusList;
    }
}
