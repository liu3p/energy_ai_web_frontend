import type {MqttClient as IMqttClient, QoS} from 'mqtt';
import {MqttApi} from '../apis/mqtt.api';
import type {IMqttAuth, IMqttTopics} from '../types';
import {Observer} from '../classes';
import mqtt from 'mqtt/dist/mqtt';
import {Utils} from '../tools';

export enum MqttClientError {
    DISCONNECTED = 'disconnected',
    RECONNECT = 'reconnect',
    AUTH_FAILED = 'authFailed',
    TOPICS_AUTH_FAILED = 'topicsAuthFailed',
    SUBSCRIBE_FAILED = 'subscribeFailed',
}

export enum MqttClientEvent {
    MESSAGE = 'message',
}

export class MqttClient extends Observer {
    readonly url: string;
    readonly qos: QoS;
    readonly topics: Set<string> = new Set<string>();
    protected client?: IMqttClient;
    protected clientId?: string;

    get isConnect() {
        return this.client ? this.client.connected : false;
    }

    constructor(url: string, qos: QoS) {
        super();
        this.url = url;
        this.qos = qos;
    }

    async connect(): Promise<void> {
        if (this.isConnect) {
            throw new Error(MqttClientError.RECONNECT);
        }
        // 注册客户端
        const authResult = await MqttApi.authentication();
        if (!authResult.state) {
            throw new Error(MqttClientError.AUTH_FAILED);
        }
        const authData = authResult.data as IMqttAuth;
        this.clientId = authData.id;

        this.client = mqtt.connect(this.url, {
            clientId: authData.id,
            username: authData.user_name,
            password: authData.password,
            keepalive: 15,
            connectTimeout: 30000,
        });

        const [promise, resolve] = Utils.getPromise<void>();
        this.client!.on('connect', () => {
            this.client!.on('message', (topic: string, payload: Buffer) => {
                this.dispatch(MqttClientEvent.MESSAGE, topic, JSON.parse(payload.toString()));
            });
            resolve();
        });
        return promise;
    }

    async subscribe(topics: string[]): Promise<string[]> {
        if (!this.isConnect) {
            throw new Error(MqttClientError.DISCONNECTED);
        }

        // 过滤已经订阅过的topic
        const filterTopics = topics.filter(topic => {
            if (this.topics.has(topic)) {
                return false;
            } else {
                this.topics.add(topic);
                return true;
            }
        });

        // 鉴权topic
        const topicsResult = await MqttApi.updateTopics(this.clientId!, filterTopics);
        if (!topicsResult.state) {
            throw new Error(MqttClientError.TOPICS_AUTH_FAILED);
        }
        const topicsData = topicsResult.data as IMqttTopics;

        // 未鉴权通过的topic
        const authFailedTopics: string[] = [];
        filterTopics.forEach(topic => {
            if (topicsData.topics.indexOf(topic) === -1) {
                authFailedTopics.push(topic);
            }
        });

        if (topicsData.topics.length === 0) {
            return authFailedTopics;
        }

        const [promise, resolve, reject] = Utils.getPromise<string[]>();
        this.client!.subscribe(topicsData.topics, {qos: this.qos}, (err, granted) => {
            if (err) {
                reject(new Error(MqttClientError.SUBSCRIBE_FAILED));
            } else {
                resolve(authFailedTopics);
            }
        });
        return promise;
    }

    close() {
        if (this.isConnect) {
            this.client!.end(true);
        }
    }
}
