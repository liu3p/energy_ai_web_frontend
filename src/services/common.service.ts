import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';

export default class CommonApi {
    // 查询SCD设备类型
    static getScdTypeList(): Promise<Response<any>> {
        return http.get(`/scdtypes`);
    }
    // 查询事项处理方式
    static getEventDealModes(): Promise<Response<any>> {
        return http.get(`/evtdealmodes`);
    }
    // 查询事项句
    static getEventMsgs(): Promise<Response<any>> {
        return http.get(`/evtmsgs`);
    }
    // 查询网络节点
    static getNodes(): Promise<Response<any>> {
        return http.get(`/nodes`);
    }
    // 查询规约参数
    static getProtocols(): Promise<Response<any>> {
        return http.get(`/protocols`);
    }
}
