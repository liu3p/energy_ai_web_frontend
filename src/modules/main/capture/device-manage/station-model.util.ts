import type {DeviceTreeNode, DynParam, ParamCardGroup, ParamCardItem, StationNode, StationParam, DispatchMode} from './device-manage.types';
import {translate} from '@/shims/cloudview-ui-next/locale-store';
import iconGrid from '@/assets/device-manage-icons/img_dianwang.png';
import iconGenerator from '@/assets/device-manage-icons/img_fadianji.png';
import iconCharging from '@/assets/device-manage-icons/img_chongdianzhuang.png';
import iconPcs from '@/assets/device-manage-icons/img_PCS.png';
import iconBms from '@/assets/device-manage-icons/img_BMS.png';
import iconSolar from '@/assets/device-manage-icons/img_guangfu.png';
import iconAc from '@/assets/device-manage-icons/img_kongtiao.png';
import iconFire from '@/assets/device-manage-icons/img_xiaofang.png';

const CHILD_KEYS = ['INLINE', 'TRANSFORMER', 'PCS', 'BMS', 'DEVICE', 'LIQUIDCOOL'];

const PARAM_UNITS: Record<string, string> = {
    SOCHigh: '%',
    SOCLow: '%',
    Capacity: 'kWh',
};

function translateDeviceManage(path: string, fallback: string): string {
    const key = `fw.deviceManage.${path}`;
    const value = translate(key);
    return value === key ? fallback : value;
}

export function getTypeLabel(type: string): string {
    return translateDeviceManage(`typeLabel.${type}`, type);
}

/** 静态配置项，仅展示在厂站参数，不参与遥控遥调 */
const STATION_STATIC_PARAM_NAMES = new Set(['Capacity', 'BatteryNo', 'Manufacturer']);

function isRemoteControlParam(item: StationParam): boolean {
    if (item.type !== 'DIGITAL' && item.type !== 'ANALOG') {
        return false;
    }
    if (STATION_STATIC_PARAM_NAMES.has(item.name)) {
        return false;
    }
    return !!item.database_id;
}

const TYPE_ICON_MAP: Record<string, string> = {
    STATION: iconGrid,
    INLINE: iconGrid,
    TRANSFORMER: iconGrid,
    PCS: iconPcs,
    BMS: iconBms,
    LIQUIDCOOL: iconAc,
    DEVICE: iconAc,
};

export function getDeviceIcon(type: string, name = ''): string {
    const normalizedName = name.toLowerCase();

    if (/充电桩|充电/.test(name)) {
        return iconCharging;
    }
    if (/柴油|发电机|fadianji/.test(name) || normalizedName.includes('generator')) {
        return iconGenerator;
    }
    if (/逆变|光伏|guangfu|inverter|pv/.test(name) || normalizedName.includes('inverter')) {
        return iconSolar;
    }
    if (/消防|xiaofang/.test(name)) {
        return iconFire;
    }
    if (/空调|水冷|kongtiao|负载|fuzai|load/.test(name)) {
        return iconAc;
    }

    return TYPE_ICON_MAP[type] ?? iconGrid;
}

export function extractStationPayload(data: unknown): StationNode | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const payload = data as Record<string, unknown>;
    if (payload.type && payload.name) {
        return payload as StationNode;
    }

    if (payload.data && typeof payload.data === 'object') {
        return extractStationPayload(payload.data);
    }

    return null;
}

export function normalizeStationPayload(root: StationNode): StationNode {
    function normalizeNode(node: StationNode): StationNode {
        const normalized: StationNode = {
            ...node,
            para: (node.para ?? []).map(item => ({
                ...item,
                value: item.value ?? '',
            })),
            dyn_para: (node.dyn_para ?? []).map(item => ({
                ...item,
                value: item.value ?? '--',
            })),
        };

        for (const childKey of CHILD_KEYS) {
            const childList = node[childKey];
            if (Array.isArray(childList)) {
                normalized[childKey] = (childList as StationNode[]).map(normalizeNode);
            }
        }

        return normalized;
    }

    return normalizeNode(root);
}

function formatNodeLabel(node: StationNode): string {
    const typeLabel = getTypeLabel(node.type);
    if (node.name && !node.name.match(/^[a-z]+\d+$/i)) {
        return node.name;
    }
    return `${node.name || typeLabel}`;
}

export function parseStationModel(root: StationNode): DeviceTreeNode {
    function buildNode(node: StationNode, nodeKey: string): DeviceTreeNode {
        const children: DeviceTreeNode[] = [];
        for (const childKey of CHILD_KEYS) {
            const childList = node[childKey];
            if (Array.isArray(childList)) {
                for (const child of childList as StationNode[]) {
                    children.push(buildNode(child, `${nodeKey}/${child.type}/${child.name}`));
                }
            }
        }
        return {
            key: nodeKey,
            type: node.type,
            name: node.name,
            label: formatNodeLabel(node),
            para: node.para ?? [],
            dyn_para: node.dyn_para ?? [],
            children,
        };
    }

    return buildNode(root, `${root.type}/${root.name}`);
}

export function getParamLabel(name: string): string {
    return translateDeviceManage(`paramLabel.${name}`, name);
}

export function getParamUnit(name: string): string {
    if (PARAM_UNITS[name]) {
        return PARAM_UNITS[name];
    }
    return translateDeviceManage(`paramUnit.${name}`, '');
}

function mapParaToCard(item: StationParam, options?: {dispatchable?: boolean}): ParamCardItem {
    const dispatchMode: DispatchMode | undefined =
        item.type === 'DIGITAL' ? 'control' : item.type === 'ANALOG' ? 'regulate' : undefined;

    return {
        key: `para-${item.name}`,
        name: item.name,
        label: getParamLabel(item.name),
        value: item.value ?? '--',
        unit: getParamUnit(item.name),
        type: item.type,
        dispatchable: options?.dispatchable ?? false,
        dispatchMode: options?.dispatchable ? dispatchMode : undefined,
        database_id: item.database_id,
        max: item.max,
        min: item.min,
    };
}

function mapDynParaToCard(item: DynParam): ParamCardItem {
    return {
        key: `dyn-${item.database_id}-${item.name}`,
        name: item.name,
        label: getParamLabel(item.name),
        value: item.value ?? '--',
        unit: getParamUnit(item.name),
        type: item.type,
        dispatchable: false,
        database_id: item.database_id,
    };
}

export function buildParamCardGroups(para: StationParam[], dynPara: DynParam[]): ParamCardGroup[] {
    const controlAdjust: ParamCardItem[] = [];
    const telemetry: ParamCardItem[] = [];
    const stationParams: ParamCardItem[] = [];

    for (const item of para) {
        if (item.type === 'ATTRIBUTE') {
            continue;
        }
        if (item.type === 'DIGITAL' || item.type === 'ANALOG') {
            if (isRemoteControlParam(item)) {
                controlAdjust.push(mapParaToCard(item, {dispatchable: true}));
            } else {
                stationParams.push(mapParaToCard(item));
            }
        }
    }

    for (const item of dynPara) {
        telemetry.push(mapDynParaToCard(item));
    }

    return [
        {title: translateDeviceManage('paramGroup.controlAdjust', '遥控遥调'), showDispatch: true, items: controlAdjust},
        {title: translateDeviceManage('paramGroup.telemetry', '遥信遥测'), showDispatch: false, items: telemetry},
        {title: translateDeviceManage('paramGroup.stationParams', '厂站参数'), showDispatch: false, items: stationParams},
    ];
}

export function parseMonitorPointRef(
    databaseId: string,
): {rid: string; did: string; pointType: string; pid: string} | null {
    const pointId = databaseId.split('$')[0];
    const parts = pointId.split('-').filter(Boolean);
    if (parts.length < 4) {
        return null;
    }
    return {
        rid: parts[0],
        did: parts[1],
        pointType: parts[2],
        pid: parts[3],
    };
}

export function buildParamCards(para: StationParam[], dynPara: DynParam[]): ParamCardItem[] {
    return buildParamCardGroups(para, dynPara).flatMap(group => group.items);
}

export function formatParamCardValue(item: ParamCardItem): string {
    if (item.value === null || item.value === undefined || item.value === '') {
        return '--';
    }
    const unit = item.unit ? item.unit : '';
    return `${item.value}${unit}`;
}

export function findFirstLeafNode(node: DeviceTreeNode): DeviceTreeNode | null {
    if (!node.children.length) {
        return node;
    }
    return findFirstLeafNode(node.children[0]);
}
