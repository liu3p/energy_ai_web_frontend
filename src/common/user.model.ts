export interface UserInfoModel {
    username: string;
    usertype: 'admin' | 'config' | 'ops' | 'guest';
}
