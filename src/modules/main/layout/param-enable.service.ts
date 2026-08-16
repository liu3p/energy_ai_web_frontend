import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';

/** 接口未就绪时使用本地假数据，联调时改为 false */
const USE_MOCK = true;

export function enableParams(): Promise<Response<null>> {
    if (USE_MOCK) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    state: true,
                    data: null,
                    msg: '参数使能成功',
                });
            }, 400);
        });
    }
    return http.post('/log/config/param-enable');
}
