import {DeviceDataModel} from '../device.model';
import {Topic} from '../dict';

export interface WebsocketDataModel {
    content: Record<string, DeviceDataModel[] | number>;
    topic: Topic;
}
