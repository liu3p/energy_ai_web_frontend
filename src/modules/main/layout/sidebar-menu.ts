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
    /** i18n key, e.g. fw.sidebar.home */
    titleKey: string;
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
        titleKey: 'fw.sidebar.home',
        path: '/main/dashboard/index',
        iconSrc: icNav1,
        iconActiveSrc: icNav1Pre,
    },
    {
        key: 'device-monitor',
        titleKey: 'fw.sidebar.operation',
        iconSrc: icNav2,
        iconActiveSrc: icNav2Pre,
        children: [
            {key: 'device-manage', titleKey: 'fw.sidebar.deviceManage', path: '/main/capture/device-manage'},
            {
                key: 'operation-strategy',
                titleKey: 'fw.sidebar.operationStrategy',
                path: '/main/capture/operation-strategy',
            },
        ],
    },
    {
        key: 'data',
        titleKey: 'fw.sidebar.data',
        iconSrc: icNav3,
        iconActiveSrc: icNav3Pre,
        children: [
            {key: 'data-collection', titleKey: 'fw.sidebar.dataCollection', path: '/main/data/collection'},
            {key: 'channel-message', titleKey: 'fw.sidebar.channelMessage', path: '/main/data/channel-message'},
        ],
    },
    // {
    //     key: 'alarm',
    //     titleKey: 'fw.sidebar.alarm',
    //     iconSrc: icNav4,
    //     iconActiveSrc: icNav4Pre,
    //     children: [{key: 'alarm-manage', titleKey: 'fw.sidebar.alarmManage', path: '/main/alarm/manage'}],
    // },
    {
        key: 'config',
        titleKey: 'fw.sidebar.config',
        iconSrc: icNav6,
        iconActiveSrc: icNav6Pre,
        children: [
            {key: 'capture-config', titleKey: 'fw.sidebar.captureConfig', path: '/main/capture/point'},
            {key: 'model-config', titleKey: 'fw.sidebar.modelConfig', path: '/main/agc/model'},
            {key: 'strategy-config', titleKey: 'fw.sidebar.strategyConfig', path: '/main/agc/strategy-config'},
            {key: 'network-config', titleKey: 'fw.sidebar.networkConfig', path: '/main/system/network'},
            {key: 'system-config', titleKey: 'fw.sidebar.systemConfig', path: '/main/system/system'},
            {key: 'display-config', titleKey: 'fw.sidebar.displayConfig', path: '/main/config/display'},
            {key: 'param-enable', titleKey: 'fw.sidebar.paramEnable', action: 'param-enable'},
        ],
    },
    {
        key: 'system',
        titleKey: 'fw.sidebar.system',
        iconSrc: icNav7,
        iconActiveSrc: icNav7Pre,
        children: [
            {key: 'perf-monitor', titleKey: 'fw.sidebar.perfMonitor', path: '/main/system/monitor'},
            {key: 'log-monitor', titleKey: 'fw.sidebar.logMonitor', path: '/main/system/log'},
            {key: 'process-manage', titleKey: 'fw.sidebar.processManage', path: '/main/system/process'},
            {
                key: 'account-manage',
                titleKey: 'fw.sidebar.accountManage',
                path: '/main/account/account',
                permission: 'admin',
            },
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

export function findMenuTitleKeyByPath(path: string, menus: SidebarMenuItem[] = sidebarMenus): string {
    for (const item of menus) {
        if (item.path === path) {
            return item.titleKey;
        }
        if (item.children) {
            const childTitleKey = findMenuTitleKeyByPath(path, item.children);
            if (childTitleKey) {
                return childTitleKey;
            }
        }
    }
    return '';
}

export function findParentTitleKeyByPath(path: string, menus: SidebarMenuItem[] = sidebarMenus): string {
    for (const item of menus) {
        if (item.children?.some(child => child.path === path)) {
            return item.titleKey;
        }
        if (item.children) {
            const nested = findParentTitleKeyByPath(path, item.children);
            if (nested) {
                return nested;
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
