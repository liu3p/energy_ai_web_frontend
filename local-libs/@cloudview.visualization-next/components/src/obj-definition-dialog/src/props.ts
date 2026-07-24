import type {PropType} from 'vue';
import type {IConfiguration, IPrimitive} from '@cloudview.visualization-next/services';
import type {Response} from 'cloudview.ui-next';

export default {
    title: String,
    formModel: {
        type: Object as PropType<IPrimitive | IConfiguration>,
        required: true,
    },
    isPrimitive: {
        type: Boolean,
        default: true,
    },
    uploadDisabled: Boolean,
    getTags: {
        type: Function as PropType<() => Promise<Response<string[]>>>,
        required: true,
    },
    submit: {
        type: Function as PropType<() => Promise<boolean>>,
    },
    checkName: {
        type: Function as PropType<(name, id) => Promise<Response<{exist: boolean}>>>,
    },
    submitText: String,
    isEdit: {
        type: Boolean,
    },
};
