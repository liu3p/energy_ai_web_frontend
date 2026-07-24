import {useGlobalConfig} from '../functions';
import type {IErrorData, IImportPreviewItem, IPaginationData, IPrimitive} from '../types';
import type {Response} from 'cloudview.ui-next';

const http = useGlobalConfig('http');
const vnbId = useGlobalConfig('vnbId');

export class PrimitiveApi {
    static getPrimitiveList(queryParam: {
        page: number;
        pageSize: number;
        engineType: string;
        tags?: string;
        keywords?: string;
    }): Promise<Response<IPaginationData<IPrimitive[]> | IErrorData>> {
        return http.value!.get('/graph-models', {queryParam: {...queryParam, vnbId: vnbId.value}});
    }

    static getPrimitiveById(id: string): Promise<Response<IPrimitive | IErrorData>> {
        return http.value!.get('/graph-model/:id', {
            routerParam: {id},
            queryParam: {vnbId: vnbId.value},
        });
    }

    static addPrimitive(data: IPrimitive): Promise<Response<any>> {
        return http.value!.post('/graph-model', data, {
            queryParam: {
                vnbId: vnbId.value,
            },
        });
    }

    static deletePrimitive(id: string): Promise<Response<any>> {
        return http.value!.delete('/graph-model/:id', {routerParam: {id}, queryParam: {vnbId: vnbId.value}});
    }

    static modifyPrimitive(id: string, data: IPrimitive): Promise<Response<any>> {
        return http.value!.put('/graph-model/:id', data, {
            routerParam: {id},
            queryParam: {
                vnbId: vnbId.value,
            },
        });
    }

    static getTags(keywords?: string): Promise<Response<string[] | IErrorData>> {
        return http.value!.get('/graph-model/tags', {
            queryParam: {
                vnbId: vnbId.value,
                keywords,
            },
        });
    }

    static importPrimitives(file: File, ids): Promise<Response<any>> {
        const fd = new FormData();
        fd.append('graphmodels', file);
        fd.append('ids', JSON.stringify(ids));
        return http.value!.post('/graph-model/import', fd, {
            queryParam: {
                vnbId: vnbId.value,
            },
        });
    }

    static importPreviewPrimitives(file: File) {
        const fd = new FormData();
        fd.append('graphmodels', file);
        return http.value!.post<IImportPreviewItem[]>('/graph-model/preview', fd, {
            queryParam: {
                vnbId: vnbId.value,
            },
        });
    }

    static exportPrimitives(ids: string[], tag = '', keywords = '', enginType = ''): Promise<Response<Blob>> {
        return http.value!.post(
            '/graph-model/export',
            ids,
            {
                queryParam: {
                    vnbId: vnbId.value,
                    tag,
                    enginType,
                    keywords,
                },
            },
            {responseType: 'blob'}
        );
    }

    static getPrimitivesByIds(ids, queryParam: Record<string, any> = {}): Promise<Response<IPrimitive[] | IErrorData>> {
        queryParam.vnbId = vnbId.value;
        return http.value!.post('/graph-models', ids, {queryParam});
    }

    static checkName(name, id): Promise<Response<any>> {
        return http.value!.get('/graph-model/checkname/:name', {
            queryParam: {
                id,
                vnbId: vnbId.value,
            },
            routerParam: {
                name,
            },
        });
    }
}
