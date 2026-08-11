import { http } from '@/common/http';
import type { Response } from 'cloudview.ui-next';


export default class dashboardServiceApi {
    // 获得配置信息
    static async getConfig(): Promise<Response<any>> {
        return http.get(`log/homepage/config`);
    }
    // 查询历史曲线
    static async getHistory(data): Promise<Response<any>> {
        return http.post(`log/influxdb/his/query`, data);

    }
}