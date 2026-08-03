import { http } from '@/common/http';
import type { Response } from 'cloudview.ui-next';


export default class dashboardManagementServiceApi {
    // 获得配置信息
    static async getConfig(): Promise<Response<any>> {
        return http.get(`log/homepage/config`);
    }
    // 修改拓扑配置信息
    static async editTopologyConfig(data: { no: string; type: string; oid: string; show_value: string; show_name: string; show_unit: string }): Promise<Response<any>> {
        return http.post(`log/homepage/config/topology`, data);
    }
    // 修改实时配置信息
    static async editRealtimeConfig(data: { no: string; type: string; oid: string; show_value: string; show_name: string; show_unit: string }): Promise<Response<any>> {
        return http.post(`log/homepage/config/realtime`, data);
    }
    // 修改基础配置信息
    static async editBasicInfoConfig(data: { no: string; type: string; oid: string; show_value: string; show_name: string; show_unit: string }): Promise<Response<any>> {
        return http.post(`log/homepage/config/basic_info`, data);
    }
    //查询全部点位信息
    static async getPoints(rtuId: string, deviceId: string, type: string): Promise<Response<any>> {
        return http.get(`log/dbcfg/rtu/${rtuId}/device/${deviceId}/type/${type}/points`);
    };
}