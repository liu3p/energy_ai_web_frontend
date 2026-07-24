import type {PropType} from 'vue';
import type {ICustomDefinition, IHttp} from '@cloudview.visualization-next/services';
import type {QoS} from 'mqtt';

export default {
    http: {
        type: Object as PropType<IHttp>,
        required: true,
    },
    vnbId: {
        type: String,
        required: true,
    },
    mqttUrl: {
        type: String,
        required: true,
    },
    mqttQos: {
        type: Number as PropType<QoS>,
    },
    topicPre: {
        type: String,
        required: true,
    },
    camelToSnake: {
        type: Boolean,
        default: false,
    },
    customBindings: {
        type: Object as PropType<ICustomDefinition>,
    },
};
