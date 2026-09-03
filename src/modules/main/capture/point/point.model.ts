/**
 * RTU 类型按 RTU id 判定（不使用接口返回的 type 字段 1/2/3/4/5）：
 * - 0–499：采集
 * - 500–699：转发
 * - 700：agc（仅 id === 700）
 * - 800：系统监视（仅 id === 800）
 * - 900：计算量（仅 id === 900）
 */
export const RTUTYPE = [
    {label: '采集', value: 0},
    {label: '转发', value: 500},
    {label: 'agc', value: 700},
    {label: '系统监视', value: 800},
    {label: '计算量', value: 900},
] as const;

export type RtuTypeItem = (typeof RTUTYPE)[number];

/** 根据 RTU id 解析类型 */
export function getRtuTypeById(id: number | string | null | undefined): RtuTypeItem | undefined {
    if (id === null || id === undefined || id === '') return undefined;
    const n = Number(id);
    if (Number.isNaN(n)) return undefined;
    if (n >= 0 && n <= 499) return RTUTYPE[0];
    if (n >= 500 && n <= 699) return RTUTYPE[1];
    if (n === 700) return RTUTYPE[2];
    if (n === 800) return RTUTYPE[3];
    if (n === 900) return RTUTYPE[4];
    return undefined;
}

export function isCollectRtu(id: number | string | null | undefined) {
    return getRtuTypeById(id)?.value === 0;
}

export function isTransferRtu(id: number | string | null | undefined) {
    return getRtuTypeById(id)?.value === 500;
}

export function isAgcRtu(id: number | string | null | undefined) {
    return getRtuTypeById(id)?.value === 700;
}

export function isMonitorRtu(id: number | string | null | undefined) {
    return getRtuTypeById(id)?.value === 800;
}

export function isCalcRtu(id: number | string | null | undefined) {
    return getRtuTypeById(id)?.value === 900;
}

export const dataTypeDict = [
    { label: 'SPECIAL', value: '0' },
    { label: 'BIT_8', value: '1' },
    { label: 'REVERSE_BIT_8', value: '2' },
    { label: 'UINT_8', value: '3' },
    { label: 'INT_8', value: '4' },
    { label: 'UINT_16', value: '5' },
    { label: 'REVERSE_UINT_16', value: '6' },
    { label: 'INT_16', value: '7' },
    { label: 'REVERSE_INT_16', value: '8' },
    { label: 'UINT_32', value: '9' },
    { label: 'REVERSE_UINT_32', value: '10' },
    { label: 'SWAP_UINT_32', value: '11' },
    { label: 'REVERSE_SWAP_UINT_32', value: '12' },
    { label: 'INT_32', value: '13' },
    { label: 'REVERSE_INT_32', value: '14' },
    { label: 'SWAP_INT_32', value: '15' },
    { label: 'REVERSE_SWAP_INT_32', value: '16' },
    { label: 'UINT_64', value: '17' },
    { label: 'REVERSE_UINT_64', value: '18' },
    { label: 'SWAP_UINT_64', value: '19' },
    { label: 'REVERSE_SWAP_UINT_64', value: '20' },
    { label: 'INT_64', value: '21' },
    { label: 'REVERSE_INT_64', value: '22' },
    { label: 'SWAP_INT_64', value: '23' },
    { label: 'REVERSE_SWAP_INT_64', value: '24' },
    { label: 'FLOAT_32', value: '25' },
    { label: 'REVERSE_FLOAT_32', value: '26' },
    { label: 'SWAP_FLOAT_32', value: '27' },
    { label: 'REVERSE_SWAP_FLOAT_32', value: '28' },
    { label: 'FLOAT_64', value: '29' },
    { label: 'REVERSE_FLOAT_64', value: '30' },
    { label: 'SWAP_FLOAT_64', value: '31' },
    { label: 'REVERSE_SWAP_FLOAT_64', value: '32' },
    { label: '自研BMS升级', value: '33' },
    { label: '高特BMS对时', value: '34' }
];

export const ycsubtypeDict = [
    { label: '其它', value: '0' },
    { label: '电压', value: '1' },
    { label: '电流', value: '2' },
    { label: '有功功率', value: '3' },
    { label: '无功功率', value: '4' },
    { label: '视在功率', value: '5' },
    { label: '功率因数', value: '6' },
    { label: '频率', value: '7' },
    { label: '温度', value: '8' },
    { label: '变比', value: '9' },
    { label: '需量', value: '10' },
    { label: '电阻', value: '11' },
    { label: '湿度', value: '12' }
];

export const yxsubtypeDict = [
    { label: '状态信号', value: '0' },
    { label: '开关信号', value: '1' },
    { label: '故障信号', value: '2' },
    { label: '告警信号', value: '3' },
];

export const ymsubtypeDict = [
    { label: '正向有功电能', value: '0' },
    { label: '反向有功电能', value: '1' },
    { label: '正向无功电能', value: '2' },
    { label: '反向无功电能', value: '3' },
    { label: '正向视在电能', value: '4' },
    { label: '反向视在电能', value: '5' },
];

export const ctrlModeDict = [
    { label: '直控', value: '0' },
    { label: '选择执行', value: '1' },
];

//新增的属性 字段
//值类型
export const attributeTypeDict = [
    { label: '0*INT', value: '0' },
    { label: '1*FLOAT', value: '1' },
    { label: '2*STRING', value: '2' },
]


export const pointType = [
    {label: '遥测', name: 'analog'},
    {label: '遥信', name: 'digital'},
    {label: '遥脉', name: 'pulse'},
    {label: '遥控', name: 'control'},
    {label: '遥调', name: 'regulate'},
    {label:'属性',name:'attribute'}
]

export const acgPointType = [
    {label: '遥测', name: 'analog'},
    {label: '遥信', name: 'digital'},
    {label: '遥脉', name: 'pulse'},
    {label: '遥控', name: 'control'},
    {label: '遥调', name: 'regulate'},
    {label:'属性',name:'attribute'}
]