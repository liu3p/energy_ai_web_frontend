import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';

//查询全部rtu信息
export const queryRtuList = (): Promise<Response<any>> => {
    return http.get('/log/dbcfg/rtus');
};
//获取所有rtu信息（不包含测点）
export const queryRtuListExceptPoints = (): Promise<Response<any>> => {
    return http.get('/log/dbcfg/rtus/except_points');
};

//查询全部rtu信息
export const queryRtuDevice = (rid: string): Promise<Response<any>> => {
    return http.get(`/log/dbcfg/rtu/${rid}/devices`);
};
//添加rtu信息
export const createRtu = (data: any): Promise<Response<any>> => {
    return http.post(`/log/dbcfg/rtu`, data);
};

//修改rtu信息
export const updateRtu = (rid: string, data: any): Promise<Response<any>> => {
    return http.put(`/log/dbcfg/rtu/${rid}`, data);
};

//删除rtu信息
export const delRtu = (rid: string): Promise<Response<any>> => {
    return http.delete(`/log/dbcfg/rtu/${rid}`);
};

export const createDevice = (rid: string, data: any): Promise<Response<any>> => {
    return http.post(`/log/dbcfg/rtu/${rid}/device`, data);
};

// 获取转发点信息
export const queryTransPoints = (data: {
    source_rtu_id: string;
    source_dev_id: string;
    rtu_id: string;
    dev_id: string;
    data_type: string;
}): Promise<Response<any>> => {
    return http.post(`log/dbcfg/trans_points`, data);
};

// 在转发RTU内添加一个设备
export const createTransDevice = (rid: string, did: string, data: any): Promise<Response<any>> => {
    return http.post(`/log/dbcfg/source_rtu/${rid}/source_device/${did}`, data);
};

export const updateDevice = (rid: string, did: string, data: any): Promise<Response<any>> => {
    return http.put(`/log/dbcfg/rtu/${rid}/device/${did}`, data);
};

export const delDevice = (rid: string, did: string): Promise<Response<any>> => {
    return http.delete(`/log/dbcfg/rtu/${rid}/device/${did}`);
};

export const updateDevicePoints = (rid: string, did: string, data: any): Promise<Response<any>> => {
    return http.post(`/log/dbcfg/rtu/${rid}/device/${did}/points`, data);
};

export const delDevicePoints = (rid: string, did: string): Promise<Response<any>> => {
    return http.delete(`/log/dbcfg/rtu/${rid}/device/${did}/points`);
};

export const queryDevicePoints = (rid: string, did: string, type: string): Promise<Response<any>> => {
    return http.get(`/log/dbcfg/rtu/${rid}/device/${did}/type/${type}/points`);
};

//导入excel点表到指定设备
export const importExcelPoints = (rid: string, did: string, file: File): Promise<Response<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post(`/log/dbcfg/rtu/${rid}/device/${did}/import_excel`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const checkFormula = (data: {
    formula: string;
    params: {[propsKey: string]: unknown};
}): Promise<Response<any>> => {
    return http.post(`/log/dbcfg/formula/check`, data);
};

export const updateFormula = (rid: string, did: string, pid: string, data: any): Promise<Response<any>> => {
    return http.post(`/log/dbcfg/rtu/${rid}/device/${did}/point/${pid}/formula`, data);
};

export const getFormula = (rid: string, did: string, pid: string): Promise<Response<any>> => {
    return http.get(`/log/dbcfg/rtu/${rid}/device/${did}/point/${pid}/formula`);
};

//获取agc rtu可以添加的测点信息  TODO 策略的测点信息
// {
//     "name":"all",
//     "paraType":"all",
//     "dataType":"ANALOG"
// }
export const queryAgcRtuPoints = (data: any): Promise<Response<any>> => {
    return http.post(`/log/agc/rtu_points`, data);
};

//获取agc模型树状结构(仅名称)
export const queryAgcModelTree = (): Promise<Response<any>> => {
    return http.get(`/log/agc/all_device_names`);
};

// 修改测点信息
export const updatePoint = (rid: string, did: string, data: any): Promise<Response<any>> => {
    return http.post(`/log/dbcfg/rtu/${rid}/device/${did}/update_points`, data);
};

// 删除测点数据
export const delPointById = (
    rid: string,
    did: string,
    data: {
        analog: {id: string}[];
        digital: {id: string}[];
        pulse: {id: string}[];
        control: {id: string}[];
        regulate: {id: string}[];
        attribute: {id: string}[];
    }
): Promise<Response<any>> => {
    return http.delete(`/log/dbcfg/rtu/${rid}/device/${did}/points_by_id`, data);
};
