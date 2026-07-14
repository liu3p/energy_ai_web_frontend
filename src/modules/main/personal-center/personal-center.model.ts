export interface UserModel {
    id: string;
    description: string;
    email: string;
    mobile_code?: string;
    mobile: string;
    nick_name: string;
    project_id: string;
    role_id: string;
    state: number;
    user_name: string;
}
export interface UpdateUserModel {
    description: string;
    email: string;
    mobile: string;
    nick_name: string;
    project_id: string;
    role_id: string;
    state: number;
}
