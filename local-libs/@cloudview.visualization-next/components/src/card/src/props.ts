import type {PropType} from 'vue';
import type {IConfiguration, IPrimitive} from '@cloudview.visualization-next/services';

export interface IOperate {
    label: string;
    callback: (item: IPrimitive | IConfiguration) => void;
}

export default {
    type: {
        type: String,
        default: 'default',
        validator(val) {
            return ['default', 'small', 'mini'].includes(val);
        },
    },
    info: Object as PropType<IPrimitive | IConfiguration>,
    imgSrc: String,
    operates: {
        type: Array as PropType<IOperate[]>,
        default() {
            return [];
        },
    },
    draggable: {
        type: Boolean,
        default: false,
    },
    customClass: {
        type: [String, Object] as PropType<string | Record<string, unknown>>,
    },
    checkAble: {
        type: Boolean,
        default: true,
    },
};
