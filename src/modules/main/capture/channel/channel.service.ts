import type {Response} from 'cloudview.ui-next';
import {http} from '@/common/http';

export const getChannelGroup = (): Promise<Response<any>> => {
    return http.get(`/log/fecfg/cgroups`);
};

export const createChannelGroup = (data: any): Promise<Response<any>> => {
    return http.post(`/log/fecfg/cgroup`, data);
};

export const updateChannelGroup = (id: string, data: any): Promise<Response<any>> => {
    return http.put(`/log/fecfg/cgroup/${id}`, data);
};

export const delChannelGroup = (id: string): Promise<Response<any>> => {
    return http.delete(`/log/fecfg/cgroup/${id}`);
};

export const createChannel = (id: string, data: any): Promise<Response<any>> => {
    return http.post(`/log/fecfg/cgroup/${id}/channel`, data);
};

export const updateChannel = (id: string,cid: string, data: any): Promise<Response<any>> => {
    return http.put(`/log/fecfg/cgroup/${id}/channel/${cid}`, data);
};

export const delChannel = (cgid: string, cid: string): Promise<Response<any>> => {
    return http.delete(`/log/fecfg/cgroup/${cgid}/channel/${cid}`);
};

export const getPlugins = (): Promise<Response<any>> => {
    return http.get(`/log/fecfg/plugins`);
};
export const notifyReload = (): Promise<Response<any>> => {
    return http.post(`/log/fecfg/notifyreload`);
};