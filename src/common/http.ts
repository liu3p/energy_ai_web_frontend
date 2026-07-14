import {getConfig} from './config_util';
import {Service} from './http.class';

export const http = new Service({
    baseURL: getConfig('API_URL'),
    timeout: 300000,
});
