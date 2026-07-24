import type {PropType} from 'vue';
import type {Response} from 'cloudview.ui-next';
import type {EngineTypeEnum} from '@cloudview.visualization-next/services';

export interface IQuery {
    tag: string;
    engineType: EngineTypeEnum;
    page: number;
    pageSize: number;
}

export default {
    title: String,
    getTags: {
        type: Function as PropType<() => Promise<Response<string[]>>>,
        required: true,
    },
    total: Number,
    query: {
        type: Object as PropType<IQuery>,
    },
    loading: Boolean,
    keywords: String,
};
