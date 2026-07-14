import {createRouter, RouterOptions, createWebHistory, RouteRecordRaw} from 'vue-router';
import Page403 from './modules/error-page/403.page.vue';
import Page404 from './modules/error-page/404.page.vue';
import Main from './modules/main/main.page.vue';
import Login from './modules/login/login.page.vue';
import {Token} from './common/token';
import {IconCollect, IconAgc, IconSystem, IconAccount} from '@/icons';

const skipPath = ['/login', '/403', '/404'];
import {clearUserInfo, initUserInfo, userInfo, userMenuList} from './common/user';
import authService from '@/common/auth.service';

export const constantRoutes = [
    {path: '', redirect: '/main/capture/point'},
    {path: '/login', component: Login},
    {path: '/403', component: Page403},
    {path: '/404', component: Page404},
];
// 动态路由
export const asyncRoutes = [
    {
        path: '/main',
        component: Main,
        meta: {label: 'fw.common.home'},
        redirect: '/main/capture/point',
        children: [
            {
                path: 'capture',
                meta: {title: '采集'},
                icon: IconCollect,
                children: [
                    {
                        path: 'monitor',
                        component: () => import('./modules/main/capture/monitor/monitor.page.vue'),
                        meta: {title: '数据监控'},
                    },
                    {
                        path: 'point',
                        component: () => import('./modules/main/capture/point/point.page.vue'),
                        meta: {title: '点表配置'},
                    },
                    {
                        path: 'channel',
                        component: () => import('./modules/main/capture/channel/channel.page.vue'),
                        meta: {title: '通道配置'},
                    },
                ],
            },
            {
                path: 'agc',
                meta: {title: 'AGC'},
                icon: IconAgc,
                children: [
                    {
                        path: 'strategy',
                        component: () => import('./modules/main/agc/strategy/strategic-management.page.vue'),
                        meta: {title: '策略配置'},
                    },
                    {
                        path: 'model',
                        component: () => import('./modules/main/agc/model-management/model-management.page.vue'),
                        meta: {title: '模型配置'},
                    },
                ],
            },
            {
                path: 'system',
                meta: {title: '系统'},
                icon: IconSystem,
                children: [
                    {
                        path: 'monitor',
                        component: () => import('./modules/main/system/monitor/monitor.page.vue'),
                        meta: {title: '性能监控'},
                    },
                    {
                        path: 'system',
                        component: () => import('./modules/main/system/system/system.page.vue'),
                        meta: {title: '系统配置'},
                    },
                    {
                        path: 'network',
                        component: () => import('./modules/main/system/network/network.page.vue'),
                        meta: {title: '网络配置'},
                    },
                    {
                        path: 'log',
                        component: () => import('./modules/main/system/log/log.page.vue'),
                        meta: {title: '日志管理'},
                    },
                    {
                        path: 'process',
                        component: () => import('./modules/main/system/process/process.page.vue'),
                        meta: {title: '进程管理'},
                    },
                ],
            },
            {
                path: 'account',
                meta: {title: '账号', permission: 'admin'},
                icon: IconAccount,
                children: [
                    {
                        path: 'account',
                        component: () => import('./modules/main/account/account-manage.page.vue'),
                        meta: {title: '账号管理', permission: 'admin'},
                    },
                ],
            },
        ],
    },
];

const filterRoutes = (routes: RouteRecordRaw[], permissions: string) => {
    return routes.filter(route => {
            if (route.meta && route.meta.permission) {
                return permissions === route.meta.permission;
            }
            return true;
    }).map(route => {
            // 如果路由有子路由，递归过滤
            if (route.children) {
                route.children = filterRoutes(route.children, permissions);
            }
            return route;
        });
};

const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
} as RouterOptions);
router.beforeEach(async (to, from, next) => {
    const userStore = userInfo.value;
    const token = Token.token;
    if (!token && to.path !== '/login') {
        next('/login');
        return;
    }
    if (token && to.path === '/login') {
        next('/');
        return;
    }
    if (token && userStore?.usertype) {
        next();
        return;
    }
    if (token && !userStore?.usertype) {
        try {
            await initUserInfo();
            const accessedRoutes = filterRoutes(asyncRoutes, userInfo.value!.usertype);
            userMenuList.value = accessedRoutes;
            accessedRoutes.forEach((route: RouteRecordRaw) => {
                router.addRoute(route);
            });
            router.addRoute({path: '/:patchMatch(.*)*', component: Page404});
            next({...to, replace: true});
        } catch (error) {
            await authService.logout();
            clearUserInfo();
            Token.clearLocalToken();
            next('/login');
        }
    } else {
        next();
    }
});
export default router;
