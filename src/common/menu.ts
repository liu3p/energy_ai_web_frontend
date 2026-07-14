import {computed, DefineComponent, ref} from 'vue';
import router from '@/router';
import {getMenus} from '@/common/common.service';
import {Token} from './token';
import {useRoute} from 'vue-router';
import {IconMenuOverview, IconMenuOverviewActive} from '@/icons';

export enum OperationPermission {
    // 新增
    add = 'add',
    // 编辑
    edit = 'edit',
    // 删除
    delete = 'delete',
    // 控制
    control = 'control',
    // 置顶
    topUp = 'topUp',
    // 快速建站
    buildSite = 'buildSite',
    // 强删电站
    removeSite = 'removeSite',
    // 重置密码
    resetPwd = 'resetPwd',
    // 启停账号
    startStopAccount = 'startStopAccount',
    // 邮箱修改
    email = 'email',
    // 移动
    move = 'move',
}
export const enableMenuIds = ref<string[]>([]);
export const menuCollapse = ref(false);
export const collapsePath = [];
// 菜单操作权限
let menuAuth: Record<string, string[]> = {};

try {
    menuAuth = JSON.parse(sessionStorage.getItem('menuAuth') || '');
} catch (e) {
    menuAuth = {};
}

/** 初始化菜单权限 */
export function initMenuPermission() {
    if (enableMenuIds.value.length > 0) {
        return;
    }
    try {
        enableMenuIds.value = JSON.parse(sessionStorage.getItem('enableMenuIds') || '');
    } catch (e) {
        //
    }
    // 缓存不存在，则调用接口
    if (enableMenuIds.value.length === 0 && Token.token) {
        menuAuth = {};
        return getMenus().then(res => {
            if (res.state) {
                enableMenuIds.value = res.data;
                enableMenuIds.value.forEach(id => {
                    const [menu, child] = id.split('_');
                    !menuAuth[menu] && (menuAuth[menu] = []);
                    child && menuAuth[menu].push(child);
                });
                sessionStorage.setItem('menuAuth', JSON.stringify(menuAuth));
            }
        });
    }
}

export function checkMenuAuth(authList: string[]) {
    return authList.every(auth => enableMenuIds.value.includes(auth));
}

export function clearMenuPermission() {
    enableMenuIds.value = [];
    menuAuth = {};
    sessionStorage.removeItem('enableMenuIds');
    sessionStorage.removeItem('menuAuth');
}

// 获取当前菜单权限
export function getCurMenuAuth() {
    const route = useRoute();
    const [id] = (route.meta.id as string | undefined)?.split('_') ?? '';
    return menuAuth[id] ?? [];
}

export interface Menu {
    id: string;
    icon?: DefineComponent<any, any, any>;
    activeIcon?: DefineComponent<any, any, any>;
    shortLabel?: string;
    parentId?: string;
    label?: string;
    path?: string;
    subMenus?: Menu[];
    show?: boolean;
    builtIn?: boolean;
}

export const menus = computed<Menu[]>(() => {
    return [
        {
            id: 'channelManage',
            icon: IconMenuOverview,
            activeIcon: IconMenuOverviewActive,
            shortLabel: 'auth.channel',
            path: '/main/channel',
        },
    ];
});

/** 根据当前路由获取菜单 */
export function getMenuByCurRoute() {
    const curPath = router.currentRoute.value.path;
    let index: [number, number] = [0, 0];
    menus.value.some((menu, fIndex) => {
        if (curPath === menu.path) {
            index[0] = fIndex;
            return true;
        } else if (menu.subMenus) {
            return menu.subMenus.some((subMenu, sIndex) => {
                if (curPath === subMenu.path!) {
                    index = [fIndex, sIndex];
                    return true;
                }
            });
        }
    });
    return index;
}

export function getFirstMenu() {
    let path = '';
    menus.value.some((menu, fIndex) => {
        if (menu.subMenus) {
            return menu.subMenus.some((subMenu, sIndex) => {
                if (subMenu.path && subMenu.show !== false && enableMenuIds.value.includes(subMenu.id)) {
                    path = subMenu.path;
                    return true;
                }
            });
        } else if (menu.path && menu.show !== false && enableMenuIds.value.includes(menu.id)) {
            path = menu.path;
            return true;
        }
    });
    return path;
}
