import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';

export default class StrategicManagementService {
    // 查询全部策略
    static async getStrategyList(): Promise<Response<any>> {
        return http.get(`/log/agc/allstrategies`);
    }
    // 查询策略(已经添加的策略)
    static async getStrategys(): Promise<Response<any>> {
        return http.get(`/log/agc/strategies`);
    }
    // 添加策略
    static async createStrategy(data: {name: string}[]): Promise<Response<any>> {
        return http.post(`/log/agc/strategies`,data);
    }
    // 获取策略参数
    static async getStrategyParams(name: string): Promise<Response<any>> {
        return http.get(`/log/agc/strategy/${name}/params`);
    }
    // 配置策略参数
    static async updateStrategyParams(name: string,data: any): Promise<Response<any>> {
        return http.post(`/log/agc/strategy/${name}/params`,data);
    }
    // 策略投入
    static async startStrategy(name: string): Promise<Response<any>> {
        return http.post(`/log/agc/strategy/${name}/run`);
    }
    // 策略退出
    static async stopStrategy(name: string): Promise<Response<any>> {
        return http.delete(`/log/agc/strategy/${name}/run`);
    }
    // 移除策略
    static async removeStrategy(name: string): Promise<Response<any>> {
        return http.delete(`/log/agc/strategy/${name}`);
    }
    //
    static async queryConflict(name: string): Promise<Response<any>> {
        return http.get(`/log/agc/strategy/${name}/runconflict`);
    }
}