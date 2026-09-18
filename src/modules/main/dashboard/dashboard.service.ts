import axios from 'axios';
import {http} from '@/common/http';
import {Token} from '@/common/token';
import {getConfig} from '@/common/config_util';
import type {Response} from 'cloudview.ui-next';

export default class dashboardServiceApi {
    // 获得配置信息
    static async getConfig(): Promise<Response<any>> {
        return http.get(`log/homepage/config`);
    }
    // 查询历史曲线
    static async getHistory(data): Promise<Response<any>> {
        return http.post(`log/influxdb/his/query`, data);
    }
    // 导出历史数据 CSV
    static exportHistory(params: {id: string; start_time: string; end_time: string}) {
        return axios.get(`${getConfig('API_URL')}/log/influxdb/his/export`, {
            params,
            responseType: 'blob',
            headers: {
                Authorization: `${Token.tokenType} ${Token.token}`,
            },
        });
    }
}
