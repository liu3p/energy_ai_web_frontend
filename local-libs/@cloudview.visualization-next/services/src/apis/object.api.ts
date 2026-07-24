import {useGlobalConfig} from '../functions';
import type {Response} from 'cloudview.ui-next';
import type {IErrorData, IObject, IObjectRes} from '../types';

const http = useGlobalConfig('http');
const vnbId = useGlobalConfig('vnbId');

export class ObjectApi {
    static postFile(file): Promise<Response<IObjectRes | IErrorData>> {
        const fd = new FormData();
        if (!(file instanceof File)) {
            fd.append('uploadfile', file, 'thumb.png');
        } else {
            fd.append('uploadfile', file);
        }
        return http.value!.post('/object', fd);
    }

    /*
     * 根据model_id获取文件
     * */
    static getFile(id): Promise<Response<File | IErrorData>> {
        return http.value!.get(
            '/object/:id',
            {
                routerParam: {id},
            },
            {responseType: 'blob'}
        );
    }

    /*
     * 删除图元文件
     * */
    static deleteFile(id): Promise<Response<any>> {
        return http.value!.delete('/object/:id', {
            routerParam: {id},
        });
    }

    static getAssets(ids: string[]): Promise<Response<IObject[] | IErrorData>> {
        return http.value!.post('/objects', ids);
    }
}
