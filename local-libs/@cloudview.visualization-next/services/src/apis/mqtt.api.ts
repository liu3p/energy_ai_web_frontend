import {useGlobalConfig} from '../functions';
import type {Response} from 'cloudview.ui-next';
import type {IMqttAuth, IMqttTopics} from '../types/subscription.type';
import type {IErrorData} from '../types';

const http = useGlobalConfig('http');

export class MqttApi {
    static authentication(): Promise<Response<IMqttAuth | IErrorData>> {
        return http.value!.get('/client');
    }

    static updateTopics(clientID: string, topics: string[]): Promise<Response<IMqttTopics | IErrorData>> {
        return http.value!.post('/topics', {
            client_id: clientID,
            topics: topics,
        });
    }
}
