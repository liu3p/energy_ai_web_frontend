import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';
import {getConfig} from '@/common/config_util';

interface ModalUpdateProps {
    name: string;
    type: string;
    para: any[];
    dyn_para: any[];
}

/** 路径参数编码：将 # 转为 %23，避免浏览器把 # 当 hash 截断 */
function enc(seg: string) {
    return encodeURIComponent(seg ?? '');
}

export default class ModelManagementServiceApi {
    // 厂站创建
    static async createAgcStation(data: {name: string}): Promise<Response<any>> {
        return http.post(`/log/agc/station`, data);
    }

    // 厂站查询
    static async queryAgcStation(): Promise<Response<any>> {
        return http.get(`/log/agc/all_devices`);
    }

    // 厂站修改
    static async updateAgcStation(name: string, data: ModalUpdateProps): Promise<Response<any>> {
        return http.put(`/log/agc/station/${enc(name)}`, data);
    }

    // 厂站删除
    static async deleteAgcStation(name: string): Promise<Response<any>> {
        return http.delete(`/log/agc/station/${enc(name)}`);
    }

    // 进线创建
    static async createAgcInline(stationName: string, data: {name: string}): Promise<Response<any>> {
        return http.post(`/log/agc/station/${enc(stationName)}/inline`, data);
    }

    // 进线查询
    static async queryAgcInline(stationName: string): Promise<Response<any>> {
        return http.get(`/log/agc/station/${enc(stationName)}/inlines`);
    }

    // 进线修改
    static async updateAgcInline(stationName: string, inlineName: string, data: ModalUpdateProps): Promise<Response<any>> {
        return http.put(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}`, data);
    }

    // 进线删除
    static async deleteAgcInline(stationName: string, inlineName: string): Promise<Response<any>> {
        return http.delete(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}`);
    }

    // 主变创建
    static async createAgcMainTrans(stationName: string, inlineName: string, data: {
        name: string
    }): Promise<Response<any>> {
        return http.post(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer`, data);
    }

    // 主变查询
    static async queryAgcMainTrans(stationName: string, inlineName: string): Promise<Response<any>> {
        return http.get(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer`);
    }

    // 主变修改
    static async updateAgcMainTrans(stationName: string, inlineName: string, transName: string, data: ModalUpdateProps) {
        return http.put(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}`, data);
    }

    // 主变删除
    static async deleteAgcMainTrans(stationName: string, inlineName: string, transName: string) {
        return http.delete(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}`);
    }

    // 设备创建
    static async createAgcStationDevice(stationName: string, inlineName: string, transName: string, data: {
        type: string,
        name: string
    }) {
        return http.post(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/device`, data);
    }

    // 设备查询
    static async queryAgcStationDevice(stationName: string, inlineName: string, transName: string) {
        return http.get(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/device`);
    }

    // 设备修改
    static async updateAgcStationDevice(stationName: string, inlineName: string, transName: string, deviceName: string, deviceType: string, data: ModalUpdateProps) {
        return http.put(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/device/${enc(deviceType)}/${enc(deviceName)}`, data);
    }

    // 设备删除
    static async deleteAgcStationDevice(stationName: string, inlineName: string, transName: string, deviceName: string, deviceType: string) {
        return http.delete(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/device/${enc(deviceType)}/${enc(deviceName)}`);
    }

    // BMS创建
    static async createAgcStationBms(stationName: string, inlineName: string, transName: string, deviceName: string, data: {
        name: string
    }) {
        return http.post(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/pcs/${enc(deviceName)}/bms`, data);
    }

    // BMS查询
    static async queryAgcStationBms(stationName: string, inlineName: string, transName: string, deviceName: string) {
        return http.get(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/pcs/${enc(deviceName)}/bms`);
    }

    // BMS修改
    static async updateAgcStationBms(stationName: string, inlineName: string, transName: string, deviceName: string, bmsName: string, data: ModalUpdateProps) {
        return http.put(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/pcs/${enc(deviceName)}/bms/${enc(bmsName)}`, data);
    }

    // BMS删除
    static async deleteAgcStationBms(stationName: string, inlineName: string, transName: string, deviceName: string, bmsName: string) {
        return http.delete(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/pcs/${enc(deviceName)}/bms/${enc(bmsName)}`);
    }

    // 水机创建
    static async createLiquidCool(stationName: string, inlineName: string, transName: string, deviceName: string, bmsName: string, data: {
        name: string;
        type: string;
    }) {
        return http.post(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/pcs/${enc(deviceName)}/bms/${enc(bmsName)}/device`, data);
    }

    static async updateLiquidCool(stationName: string, inlineName: string, transName: string, pcsName: string, bmsName: string, devName: string, type: string, data: ModalUpdateProps) {
        return http.put(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/pcs/${enc(pcsName)}/bms/${enc(bmsName)}/device/${enc(type)}/${enc(devName)}`, data);
    }

    // 水机删除
    static async deleteLiquidCool(stationName: string, inlineName: string, transName: string, pcsName: string, bmsName: string, devName: string, type: string) {
        return http.delete(`/log/agc/station/${enc(stationName)}/inline/${enc(inlineName)}/transformer/${enc(transName)}/pcs/${enc(pcsName)}/bms/${enc(bmsName)}/device/${enc(type)}/${enc(devName)}`);
    }

    // 查询可见设备
    static async queryDeviceTypes(): Promise<Response<any>> {
        return http.get(`/log/agc/devicetype/all_devicetypes`);
    }

    // 选点源数据查询
    static async getTransferGroupPointSource(type: string): Promise<Response<any>> {
        return http.get(`/log/dbcfg/points/${enc(type)}`);
    }

    // 获取当前设备下可以挂在哪些子设备
    static async getDeviceTypes(type: string): Promise<Response<any>> {
        return http.get(`/log/agc/devicetype/${enc(type)}`);
    }


    // 添加agc设备
    static async createAgcDevice(device_name: string, data: {
        name: string;
        type: string;
    }) {
        return http.post(`/log/agc/device/${enc(device_name)}`, data);
    }

    static async updateAgcDevice(device_name: string, data: {
        name: string;
        type: string;
        dyn_para?: any;
        para?: any;
    }): Promise<Response<any>> {
        return http.put(`/log/agc/device/${enc(device_name)}`, data);
    }
    static async deleteAgcDevice(device_name: string): Promise<Response<any>> {
        return http.delete(`/log/agc/device/${enc(device_name)}`);
    }
}
