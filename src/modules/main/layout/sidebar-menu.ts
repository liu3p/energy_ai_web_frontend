import type {Component} from 'vue';

import icNav1 from '@/assets/sidebar-icons/ic_nav1.svg';
import icNav1Pre from '@/assets/sidebar-icons/ic_nav1_pre.svg';
import icNav2 from '@/assets/sidebar-icons/ic_nav2.svg';
import icNav2Pre from '@/assets/sidebar-icons/ic_nav2_pre.svg';
import icNav3 from '@/assets/sidebar-icons/ic_nav3.svg';
import icNav3Pre from '@/assets/sidebar-icons/ic_nav3_pre.svg';
import icNav4 from '@/assets/sidebar-icons/ic_nav4.svg';
import icNav4Pre from '@/assets/sidebar-icons/ic_nav4_pre.svg';
import icNav5 from '@/assets/sidebar-icons/ic_nav5.svg';
import icNav5Pre from '@/assets/sidebar-icons/ic_nav5_pre.svg';
import icNav6 from '@/assets/sidebar-icons/ic_nav6.svg';
import icNav6Pre from '@/assets/sidebar-icons/ic_nav6_pre.svg';
import icNav7 from '@/assets/sidebar-icons/ic_nav7.svg';
import icNav7Pre from '@/assets/sidebar-icons/ic_nav7_pre.svg';

export interface SidebarMenuItem {
    key: string;
    title: string;
    path?: string;
    /** 点击后触发动作，不跳转页面 */
    action?: 'param-enable';
    /** 兼容旧用法：Vue 图标组件 */
    icon?: Component;
    /** 默认态 SVG（可直接引用 assets 下的 .svg） */
    iconSrc?: string;
    /** 选中/激活态 SVG */
    iconActiveSrc?: string;
    permission?: string;
    children?: SidebarMenuItem[];
}

/** 左侧导航菜单配置 */
export const sidebarMenus: SidebarMenuItem[] = [
    {
        key: 'dashboard',
        title: '首页',
        path: '/main/dashboard/index',
        iconSrc: icNav1,
        iconActiveSrc: icNav1Pre,
    },
    {
        key: 'device-monitor',
        title: '运行',
        iconSrc: icNav2,
        iconActiveSrc: icNav2Pre,
        children: [
            {key: 'device-manage', title: '设备监控', path: '/main/capture/device-manage'},
            {key: 'operation-strategy', title: '运行策略', path: '/main/capture/operation-strategy'},
        ],
    },
    {
        key: 'data',
        title: '数据',
        iconSrc: icNav3,
        iconActiveSrc: icNav3Pre,
        children: [
            {key: 'data-collection', title: '数据采集', path: '/main/data/collection'},
            {key: 'channel-message', title: '通道报文', path: '/main/data/channel-message'},
        ],
    },
    // {
    //     key: 'alarm',
    //     title: '告警',
    //     iconSrc: icNav4,
    //     iconActiveSrc: icNav4Pre,
    //     children: [{key: 'alarm-manage', title: '告警管理', path: '/main/alarm/manage'}],
    // },
    {
        key: 'config',
        title: '配置',
        iconSrc: icNav6,
        iconActiveSrc: icNav6Pre,
        children: [
            {key: 'capture-config', title: '采集配置', path: '/main/capture/point'},
            {key: 'model-config', title: '模型配置', path: '/main/agc/model'},
            {key: 'strategy-config', title: '策略配置', path: '/main/agc/strategy-config'},
            {key: 'network-config', title: '网络配置', path: '/main/system/network'},
            {key: 'system-config', title: '系统配置', path: '/main/system/system'},
            {key: 'display-config', title: '展示配置', path: '/main/config/display'},
            {key: 'param-enable', title: '参数使能', action: 'param-enable'},
        ],
    },
    {
        key: 'system',
        title: '系统',
        iconSrc: icNav7,
        iconActiveSrc: icNav7Pre,
        children: [
            {key: 'perf-monitor', title: '性能监控', path: '/main/system/monitor'},
            {key: 'log-monitor', title: '日志监控', path: '/main/system/log'},
            {key: 'process-manage', title: '进程管理', path: '/main/system/process'},
            {key: 'account-manage', title: '账号管理', path: '/main/account/account', permission: 'admin'},
        ],
    },
];

export function filterSidebarMenus(menus: SidebarMenuItem[], usertype: string): SidebarMenuItem[] {
    return menus
        .filter(item => !item.permission || item.permission === usertype)
        .map(item => ({
            ...item,
            children: item.children ? filterSidebarMenus(item.children, usertype) : undefined,
        }))
        .filter(item => item.path || item.action || (item.children && item.children.length > 0));
}

export function findMenuTitleByPath(path: string, menus: SidebarMenuItem[] = sidebarMenus): string {
    for (const item of menus) {
        if (item.path === path) {
            return item.title;
        }
        if (item.children) {
            const childTitle = findMenuTitleByPath(path, item.children);
            if (childTitle) {
                return childTitle;
            }
        }
    }
    return '';
}

export function isMenuItemActive(item: SidebarMenuItem, currentPath: string): boolean {
    if (item.path === currentPath) {
        return true;
    }
    return item.children?.some(child => child.path === currentPath) ?? false;
}
