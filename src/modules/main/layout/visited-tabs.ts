import {computed, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {findMenuTitleKeyByPath} from './sidebar-menu';

export interface VisitedTab {
    path: string;
    titleKey: string;
    titleFallback: string;
    closable: boolean;
    componentName: string;
}

const HOME_PATH = '/main/dashboard/index';
const STORAGE_KEY = 'ems-visited-tabs';

const PATH_COMPONENT_NAME: Record<string, string> = {
    '/main/dashboard/index': 'DashboardIndex',
    '/main/capture/monitor': 'CaptureMonitor',
    '/main/capture/device-manage': 'DeviceManage',
    '/main/capture/operation-strategy': 'OperationStrategy',
    '/main/capture/point': 'CapturePoint',
    '/main/capture/channel': 'CaptureChannel',
    '/main/agc/strategy': '',
    '/main/agc/strategy-config': '',
    '/main/agc/model': 'ModelConfig',
    '/main/data/collection': 'DataCollection',
    '/main/data/channel-message': 'ChannelMessage',
    '/main/alarm/manage': 'AlarmManage',
    '/main/config/display': 'DisplayConfig',
    '/main/system/monitor': 'PerfMonitor',
    '/main/system/system': 'SystemConfig',
    '/main/system/network': 'NetworkConfig',
    '/main/system/log': 'LogMonitor',
    '/main/system/process': 'ProcessManage',
    '/main/account/account': 'AccountManage',
};

function pathToComponentName(path: string) {
    return PATH_COMPONENT_NAME[path] || '';
}

function resolveTitle(path: string, metaTitle?: unknown): {titleKey: string; titleFallback: string} {
    const menuTitleKey = findMenuTitleKeyByPath(path);
    const rawTitle = typeof metaTitle === 'string' ? metaTitle : '';
    const titleKey = menuTitleKey || (rawTitle.startsWith('fw.') ? rawTitle : '');
    return {
        titleKey,
        titleFallback: titleKey ? '' : rawTitle || path,
    };
}

function loadStoredTabs(): VisitedTab[] {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter((item): item is VisitedTab => {
            if (!item || typeof item.path !== 'string' || !item.path.startsWith('/main/')) {
                return false;
            }
            if (!item.componentName) {
                item.componentName = pathToComponentName(item.path);
            }
            return true;
        });
    } catch {
        return [];
    }
}

const tabs = ref<VisitedTab[]>(loadStoredTabs());

watch(
    tabs,
    value => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    },
    {deep: true},
);

function upsertTab(path: string, metaTitle?: unknown) {
    if (!path.startsWith('/main/')) {
        return;
    }
    const exists = tabs.value.some(item => item.path === path);
    if (exists) {
        return;
    }
    const {titleKey, titleFallback} = resolveTitle(path, metaTitle);
    tabs.value.push({
        path,
        titleKey,
        titleFallback,
        closable: path !== HOME_PATH,
        componentName: pathToComponentName(path),
    });
}

export function clearVisitedTabs() {
    tabs.value = [];
    sessionStorage.removeItem(STORAGE_KEY);
}

export function useVisitedTabs() {
    const route = useRoute();
    const router = useRouter();
    const activePath = computed(() => route.path);

    watch(
        () => route.path,
        path => {
            upsertTab(path, route.meta.title);
        },
        {immediate: true},
    );

    function openTab(path: string) {
        if (path === route.path) {
            return;
        }
        void router.push(path);
    }

    function closeTab(path: string) {
        const index = tabs.value.findIndex(item => item.path === path);
        if (index < 0 || !tabs.value[index].closable) {
            return;
        }
        const closingActive = tabs.value[index].path === route.path;
        tabs.value.splice(index, 1);
        if (!closingActive) {
            return;
        }
        const fallback = tabs.value[index - 1] ?? tabs.value[tabs.value.length - 1];
        void router.push(fallback?.path || HOME_PATH);
    }

    function closeOthers(path: string) {
        tabs.value = tabs.value.filter(item => !item.closable || item.path === path);
        if (route.path !== path) {
            void router.push(path);
        }
    }

    return {
        tabs,
        activePath,
        openTab,
        closeTab,
        closeOthers,
    };
}
