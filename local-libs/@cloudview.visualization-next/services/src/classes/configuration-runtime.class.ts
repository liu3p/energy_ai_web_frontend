import {Observer} from './observer.class';
import type {IConfiguration} from '../types';
import {BoardRuntime} from './board-runtime.class';
import {DeviceApi} from '../apis/device.api';

export class ConfigurationRuntime extends Observer {
    id: string;
    name: string;
    config: IConfiguration;
    boards: BoardRuntime[] = [];
    devices = new Map();

    constructor(config: IConfiguration) {
        super();
        this.config = config;
        this.id = config.id!;
        this.name = config.name;
        this.config.content!.forEach(item => {
            this.boards.push(new BoardRuntime(item));
        });
    }

    async getDevice(id: string) {
        if (id === '') {
            return false;
        }
        if (!this.devices.has(id)) {
            const result = await DeviceApi.getDevice(id);
            if (result.status) {
                this.devices.set(id, result.data);
            }
        }
        return this.devices.get(id);
    }
}
