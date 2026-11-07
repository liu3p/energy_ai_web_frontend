import {queryRtuListExceptPoints} from '@/modules/main/capture/point/point.service';

export type HomepageOidIssue = {
    oid: string;
    reason: 'format' | 'rtu' | 'device';
};

/** OID 形如 rtuId-deviceId-tableNo-gin，至少前两段用于定位 RTU/设备 */
export function parseHomepageOid(oid: string): {rtuId: string; deviceId: string} | null {
    const parts = String(oid ?? '')
        .trim()
        .split('-')
        .filter(Boolean);
    if (parts.length < 2) return null;
    return {rtuId: parts[0], deviceId: parts[1]};
}

function buildRtuDeviceSet(rtus: any[]): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();
    for (const rtu of rtus ?? []) {
        const rtuId = String(rtu?.id ?? '');
        if (!rtuId) continue;
        const devices = new Set<string>();
        for (const device of rtu?.device ?? []) {
            const deviceId = String(device?.id ?? '');
            if (deviceId) devices.add(deviceId);
        }
        map.set(rtuId, devices);
    }
    return map;
}

/** 校验看板配置项中的 OID 是否对应现有 RTU/设备；固定值（type=3）或空 OID 跳过 */
export async function validateHomepageConfigOids(
    items: Array<{oid?: string; type?: string | number}>,
): Promise<HomepageOidIssue[]> {
    const candidates = (items ?? [])
        .filter(item => String(item?.type ?? '') !== '3')
        .map(item => String(item?.oid ?? '').trim())
        .filter(Boolean);

    if (!candidates.length) return [];

    const res = await queryRtuListExceptPoints();
    if (!res.state || !Array.isArray(res.data)) {
        throw new Error('rtu_list_failed');
    }
    const rtuDeviceMap = buildRtuDeviceSet(res.data);
    const issues: HomepageOidIssue[] = [];
    const seen = new Set<string>();

    for (const oid of candidates) {
        if (seen.has(oid)) continue;
        seen.add(oid);
        const parsed = parseHomepageOid(oid);
        if (!parsed) {
            issues.push({oid, reason: 'format'});
            continue;
        }
        const devices = rtuDeviceMap.get(parsed.rtuId);
        if (!devices) {
            issues.push({oid, reason: 'rtu'});
            continue;
        }
        if (!devices.has(parsed.deviceId)) {
            issues.push({oid, reason: 'device'});
        }
    }
    return issues;
}
