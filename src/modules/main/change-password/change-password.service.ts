import {http} from '@/common/http';
import {hmac} from '@/common/sha1';

export default class ChangePasswordAPI {
    static changePassword(data: {new_password: string; password: string}) {
        return http.post('/log/user/updatepwd', {
            newpwd: data.new_password,
            oldpwd: data.password,
        });
    }
}
