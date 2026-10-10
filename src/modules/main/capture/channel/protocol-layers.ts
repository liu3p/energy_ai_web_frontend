/**
 * 通道协议最多三层（与后端 id/1000+1 一致）：
 * - 0–999 → 第1层
 * - 1000–1999 → 第2层
 * - 2000–2999 → 第3层
 * - >=3000 不进入前三层下拉
 */

export type ProtocolParam = {
    name: string;
    value?: string;
    valuelist?: string;
    [key: string]: unknown;
};

export type ProtocolPlugin = {
    id: number | string;
    name?: string;
    type?: string;
    parameters?: ProtocolParam[];
    [key: string]: unknown;
};

export type ProtocolLayer = {
    type: string;
    plugins: ProtocolPlugin[];
};

export type LayerState = {
    type: string;
    options: ProtocolPlugin[];
    selectedId: number | string | '';
    selected: ProtocolPlugin | null;
};

const LAYER_TYPES = ['1', '2', '3'] as const;

/** 仅接受层号 1/2/3；更高层返回空（不并入第3层） */
export function clampLayerType(type: string | number | null | undefined): string {
    const n = Number(type);
    if (Number.isNaN(n) || n < 1 || n > 3) return '';
    return String(n);
}

/**
 * 由插件 id 推算层号（id/1000+1，且最多三层）：
 * - 0–999 → 1
 * - 1000–1999 → 2
 * - 2000–2999 → 3
 * - >=3000 → 不参与前三层
 */
export function getLayerTypeByPluginId(id: number | string | null | undefined): string {
    const n = Number(id);
    if (Number.isNaN(n)) return '';
    return clampLayerType(Math.floor(n / 1000) + 1);
}

/** 规范化 getPlugins：按 id 归入最多三层 */
export function normalizePluginLayers(data: unknown): ProtocolLayer[] {
    const buckets = new Map<string, ProtocolPlugin[]>();
    for (const t of LAYER_TYPES) {
        buckets.set(t, []);
    }

    const pushPlugin = (plugin: ProtocolPlugin, hintType?: string) => {
        const layerType =
            getLayerTypeByPluginId(plugin.id) || clampLayerType(plugin.type) || clampLayerType(hintType);
        if (!layerType || !buckets.has(layerType)) return;
        buckets.get(layerType)!.push({...plugin, type: layerType});
    };

    if (Array.isArray(data)) {
        for (const item of data as any[]) {
            const hintType = item?.type != null ? String(item.type) : undefined;
            const plugins = Array.isArray(item?.plugins) ? item.plugins : [];
            for (const p of plugins) {
                pushPlugin(p, hintType);
            }
        }
    } else if (data && typeof data === 'object') {
        // 兼容旧结构 {appplugin, linkplugin}
        const legacy = data as {appplugin?: ProtocolPlugin[]; linkplugin?: ProtocolPlugin[]};
        for (const p of legacy.linkplugin ?? []) {
            pushPlugin({...p, type: p.type ?? 'LINK'});
        }
        for (const p of legacy.appplugin ?? []) {
            pushPlugin({...p, type: p.type ?? 'APP'});
        }
    }

    return LAYER_TYPES.filter(t => (buckets.get(t)?.length ?? 0) > 0).map(t => ({
        type: t,
        plugins: buckets.get(t)!,
    }));
}

/** 展示用：第1层在上，第3层在下（1→2→3） */
export function sortLayersForDisplay(layers: ProtocolLayer[]): ProtocolLayer[] {
    return [...layers].sort((a, b) => Number(a.type) - Number(b.type));
}

/** 层标题文案模板 key（相对 fw.capturePoint），统一为「第N层协议」 */
export function getProtocolLayerLabelKey(_type: string): string {
    return 'protocolLayerN';
}

function resolvePluginType(plugin: ProtocolPlugin): string {
    // 兼容旧数据：APP→2；LINK 若 id 不在 0–999 则无法归入前三层
    if (plugin?.type === 'APP') return getLayerTypeByPluginId(plugin.id) || '2';
    if (plugin?.type === 'LINK') return getLayerTypeByPluginId(plugin.id) || '';
    const byId = getLayerTypeByPluginId(plugin?.id);
    if (byId) return byId;
    return clampLayerType(plugin?.type);
}

/** 从目录插件复制一份，并用已存 parameters 覆盖 value，补齐 valuelist */
export function mergePluginWithCatalog(
    saved: ProtocolPlugin | undefined,
    catalog: ProtocolPlugin | undefined
): ProtocolPlugin | null {
    if (!catalog && !saved) return null;
    if (!catalog) {
        return saved ? {...saved, parameters: [...(saved.parameters ?? [])]} : null;
    }
    const savedMap = new Map((saved?.parameters ?? []).map(p => [p.name, p]));
    const parameters = (catalog.parameters ?? []).map(p => {
        const fromSaved = savedMap.get(p.name);
        return {
            ...p,
            value: fromSaved?.value ?? p.value,
            valuelist: p.valuelist ?? fromSaved?.valuelist,
        };
    });
    return {
        ...catalog,
        ...(saved ?? {}),
        id: saved?.id ?? catalog.id,
        name: catalog.name ?? saved?.name,
        type: catalog.type ?? saved?.type,
        parameters,
    };
}

/** 根据目录层与已存 plugins 初始化各层状态（展示序：降序，最多三层） */
export function buildLayerStates(
    catalogLayers: ProtocolLayer[],
    savedPlugins: ProtocolPlugin[] = []
): LayerState[] {
    const savedByType = new Map<string, ProtocolPlugin>();
    for (const p of savedPlugins) {
        const t = resolvePluginType(p);
        if (t) savedByType.set(t, p);
    }

    const displayLayers = sortLayersForDisplay(catalogLayers).filter(l =>
        LAYER_TYPES.includes(l.type as (typeof LAYER_TYPES)[number])
    );
    return displayLayers.map(layer => {
        const saved = savedByType.get(layer.type);
        const catalogPlugin = saved
            ? layer.plugins.find(p => String(p.id) === String(saved.id))
            : undefined;
        const selected = mergePluginWithCatalog(saved, catalogPlugin ?? undefined);
        return {
            type: layer.type,
            options: layer.plugins,
            selectedId: selected?.id ?? '',
            selected,
        };
    });
}

/** 切换某层选中协议 */
export function selectLayerPlugin(state: LayerState, id: number | string | ''): LayerState {
    if (id === '' || id === null || id === undefined) {
        return {...state, selectedId: '', selected: null};
    }
    const catalog = state.options.find(p => String(p.id) === String(id));
    if (!catalog) {
        return {...state, selectedId: id, selected: null};
    }
    return {
        ...state,
        selectedId: id,
        selected: mergePluginWithCatalog(undefined, catalog),
    };
}

/**
 * 组装保存用 plugins（图4改动后）：
 * 仅 { id, parameters:[{name,value}] }，按层升序，不含 name/type
 */
export function buildPluginsPayload(
    states: LayerState[]
): Array<{id: number; parameters: Array<{name: string; value: string}>}> {
    return [...states]
        .filter(s => s.selected != null && (s.selected.id || s.selected.id === 0))
        .sort((a, b) => Number(a.type) - Number(b.type))
        .map(s => ({
            id: Number(s.selected!.id),
            parameters: (s.selected!.parameters ?? []).map(p => ({
                name: p.name,
                value: String(p.value ?? ''),
            })),
        }));
}
