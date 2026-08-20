import {http} from '@/common/http';
import type {Response} from 'cloudview.ui-next';

export function enableParams(checkpwd: string): Promise<Response<null>> {
    return http.post('/log/system/para_enable', {checkpwd});
}
