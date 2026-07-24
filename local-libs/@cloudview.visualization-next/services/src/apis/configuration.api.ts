import {useGlobalConfig} from '../functions';
import type {EngineTypeEnum, IConfiguration, IErrorData, IPaginationData} from '../types';
import type {Response} from 'cloudview.ui-next';

const http = useGlobalConfig('http');
const vnbId = useGlobalConfig('vnbId');

export class ConfigurationApi {
    static getConfigurationList(queryParam: {
        page?: number;
        pageSize?: number;
        keywords?: string;
        tag?: string;
        engineType?: EngineTypeEnum;
        vnbId?: string;
    }): Promise<Response<IPaginationData<IConfiguration[]> | IErrorData>> {
        return http.value!.get('/components', {
            queryParam: {...queryParam, vnbId: vnbId.value},
        });
    }

    /*
     * 获取分组信息
     * */
    static getTags(textSearch: string): Promise<Response<string[] | IErrorData>> {
        const queryParam: Record<string, string> = {};
        queryParam.vnbId = vnbId.value!;
        if (textSearch) {
            queryParam.keywords = textSearch;
        }
        return http.value!.get('/component/tags', {queryParam});
    }

    /*
     * 新建组态图
     * */
    static addConfiguration(fd: IConfiguration): Promise<Response<any>> {
        return http.value!.post('/component', fd);
    }

    static deleteConfiguration(id: string): Promise<Response<any>> {
        const queryParam = {vnbId: vnbId.value};
        return http.value!.delete('/component/:id', {
            routerParam: {id},
            queryParam,
        });
    }

    static getConfigurationById(id: string): Promise<Response<IConfiguration | IErrorData>> {
        const queryParam = {vnbId: vnbId.value};
        return http.value!.get('/component/:id', {
            routerParam: {id},
            queryParam,
        });
    }

    static updateConfiguration(fd: IConfiguration, id?: string): Promise<Response<any>> {
        const queryParam = {vnbId: vnbId.value};
        return http.value!.put('/component/:id', fd, {
            routerParam: {id},
            queryParam,
        });
    }

    static checkName(name: string, id: string): Promise<Response<any>> {
        const queryParam = {vnbId: vnbId.value, id: id};
        return http.value!.get('/component/checkname/:name', {queryParam: queryParam, routerParam: {name: name}});
    }

    static getStationList(parentId: string): Promise<Response<any>> {
        return http.value!.get('/tree', {
            queryParam: {vnbId: vnbId.value, parentId: parentId || ''},
        });
    }

    static exportConfiguration(ids: string[], tag = '', keywords = '', engineType = '') {
        return http.value!.post<Blob>(
            '/component/export',
            ids,
            {
                queryParam: {
                    vnbId: vnbId.value,
                    tag,
                    keywords,
                    engineType,
                },
            },
            {responseType: 'blob'}
        );
    }

    static importPreviewConfigurations(file: File) {
        const fd = new FormData();
        fd.append('components', file);
        return http.value!.post('/component/preview', fd, {
            queryParam: {vnbId: vnbId.value},
        });
    }

    static importConfigurations(file: File, ids: string[]) {
        const fd = new FormData();
        fd.append('components', file);
        fd.append('ids', JSON.stringify(ids));
        return http.value!.post('/component/import', fd, {
            queryParam: {vnbId: vnbId.value},
        });
    }
}
