import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';
import {getConfig} from '@/common/config_util';

interface ModalUpdateProps {
    name: string;
    type: string;
    para: any[];
    dyn_para: any[];
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
        return http.put(`/log/agc/station/${name}`, data);
    }

    // 厂站删除
    static async deleteAgcStation(name: string): Promise<Response<any>> {
        return http.delete(`/log/agc/station/${name}`);
    }

    // 进线创建
    static async createAgcInline(stationName: string, data: {name: string}): Promise<Response<any>> {
        return http.post(`/log/agc/station/${stationName}/inline`, data);
    }

    // 进线查询
    static async queryAgcInline(stationName: string): Promise<Response<any>> {
        return http.get(`/log/agc/station/${stationName}/inlines`);
    }

    // 进线修改
    static async updateAgcInline(stationName: string, inlineName: string, data: ModalUpdateProps): Promise<Response<any>> {
        return http.put(`/log/agc/station/${stationName}/inline/${inlineName}`, data);
    }

    // 进线删除
    static async deleteAgcInline(stationName: string, inlineName: string): Promise<Response<any>> {
        return http.delete(`/log/agc/station/${stationName}/inline/${inlineName}`);
    }

    // 主变创建
    static async createAgcMainTrans(stationName: string, inlineName: string, data: {
        name: string
    }): Promise<Response<any>> {
        return http.post(`/log/agc/station/${stationName}/inline/${inlineName}/transformer`, data);
    }

    // 主变查询
    static async queryAgcMainTrans(stationName: string, inlineName: string): Promise<Response<any>> {
        return http.get(`/log/agc/station/${stationName}/inline/${inlineName}/transformer`);
    }

    // 主变修改
    static async updateAgcMainTrans(stationName: string, inlineName: string, transName: string, data: ModalUpdateProps) {
        return http.put(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}`, data);
    }

    // 主变删除
    static async deleteAgcMainTrans(stationName: string, inlineName: string, transName: string) {
        return http.delete(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}`);
    }

    // 设备创建
    static async createAgcStationDevice(stationName: string, inlineName: string, transName: string, data: {
        type: string,
        name: string
    }) {
        return http.post(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/device`, data);
    }

    // 设备查询
    static async queryAgcStationDevice(stationName: string, inlineName: string, transName: string) {
        return http.get(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/device`);
    }

    // 设备修改
    static async updateAgcStationDevice(stationName: string, inlineName: string, transName: string, deviceName: string, deviceType: string, data: ModalUpdateProps) {
        return http.put(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/device/${deviceType}/${deviceName}`, data);
    }

    // 设备删除
    static async deleteAgcStationDevice(stationName: string, inlineName: string, transName: string, deviceName: string, deviceType: string) {
        return http.delete(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/device/${deviceType}/${deviceName}`);
    }

    // BMS创建
    static async createAgcStationBms(stationName: string, inlineName: string, transName: string, deviceName: string, data: {
        name: string
    }) {
        return http.post(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/pcs/${deviceName}/bms`, data);
    }

    // BMS查询
    static async queryAgcStationBms(stationName: string, inlineName: string, transName: string, deviceName: string) {
        return http.get(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/pcs/${deviceName}/bms`);
    }

    // BMS修改
    static async updateAgcStationBms(stationName: string, inlineName: string, transName: string, deviceName: string, bmsName: string, data: ModalUpdateProps) {
        return http.put(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/pcs/${deviceName}/bms/${bmsName}`, data);
    }

    // BMS删除
    static async deleteAgcStationBms(stationName: string, inlineName: string, transName: string, deviceName: string, bmsName: string) {
        return http.delete(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/pcs/${deviceName}/bms/${bmsName}`);
    }

    // 水机创建
    static async createLiquidCool(stationName: string, inlineName: string, transName: string, deviceName: string, bmsName: string, data: {
        name: string;
        type: string;
    }) {
        return http.post(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/pcs/${deviceName}/bms/${bmsName}/device`, data);
    }

    static async updateLiquidCool(stationName: string, inlineName: string, transName: string, pcsName: string, bmsName: string, devName: string, type: string, data: ModalUpdateProps) {
        return http.put(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/pcs/${pcsName}/bms/${bmsName}/device/${type}/${devName}`, data);
    }

    // 水机删除
    static async deleteLiquidCool(stationName: string, inlineName: string, transName: string, pcsName: string, bmsName: string, devName: string, type: string) {
        return http.delete(`/log/agc/station/${stationName}/inline/${inlineName}/transformer/${transName}/pcs/${pcsName}/bms/${bmsName}/device/${type}/${devName}`);
    }

    // 查询可见设备
    static async queryDeviceTypes(): Promise<Response<any>> {
        return http.get(`/log/agc/devicetype/all_devicetypes`);
    }

    // 选点源数据查询
    static async getTransferGroupPointSource(type: string): Promise<Response<any>> {
        return http.get(`/log/dbcfg/points/${type}`);
    }

    // 获取当前设备下可以挂在哪些子设备
    static async getDeviceTypes(type: string): Promise<Response<any>> {
        return http.get(`/log/agc/devicetype/${type}`);
    }


    // 添加agc设备
    static async createAgcDevice(device_name: string, data: {
        name: string;
        type: string;
    }) {
        return http.post(`/log/agc/device/${device_name}`, data);
    }

    static async updateAgcDevice(device_name: string, data: {
        name: string;
        type: string;
        dyn_para?: any;
        para?: any;
    }): Promise<Response<any>> {
        return http.put(`/log/agc/device/${device_name}`, data);
    }
    static async deleteAgcDevice(device_name: string): Promise<Response<any>> {
        return http.delete(`/log/agc/device/${device_name}`);
    }
}