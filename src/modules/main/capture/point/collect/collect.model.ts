import {
    dataTypeDict,
    ycsubtypeDict,
    yxsubtypeDict,
    ymsubtypeDict,
    ctrlModeDict,
    attributeTypeDict,
} from '../point.model';

export type ColumnType = 'text' | 'select';
export type ConditionType = 'isTransfer' | '!isTransfer';

export interface ColumnConfig {
    prop: string;
    label: string;
    width: number;
    fixed?: boolean;
    type?: ColumnType;
    selectOptions?: Array<{label: string; value: any}>;
    condition?: ConditionType;
}

export interface TableTypeConfig {
    columns: ColumnConfig[];
}

export const tableConfigs: Record<string, TableTypeConfig> = {
    analog: {
        columns: [
            {prop: 'index', label: '序号', width: 80, fixed: true},
            {prop: 'id', label: 'OID', width: 160},
            {prop: 'gin', label: '点号', width: 100, type: 'text'},
            {prop: 'register', label: '原始地址', width: 160, type: 'text'},
            {prop: 'name', label: '原始名', width: 160, type: 'text'},
            {prop: 'aliasname', label: '别名', width: 160, type: 'text', condition: 'isTransfer'},
            {prop: 'subtype', label: '遥测子类型', width: 160, type: 'select', selectOptions: ycsubtypeDict},
            {prop: 'datatype', label: '数据类型', width: 160, type: 'select', selectOptions: dataTypeDict},
            {prop: 'code', label: '功能码', width: 160, type: 'text'},
            {prop: 'bitoffset', label: '位偏移', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'offset', label: '偏移量', width: 160, type: 'text'},
            {prop: 'coeff', label: '系数', width: 160, type: 'text'},
            {prop: 'unit', label: '单位', width: 160, type: 'text'},
            {prop: 'upperlimit', label: '上限', width: 160, type: 'text'},
            {prop: 'lowerlimit', label: '下限', width: 160, type: 'text'},
            {prop: 'calculated', label: '计算点', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'manual', label: '人工置数点', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'enablewarning', label: '报警允许', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'trans', label: '是否转发', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'hisperiod', label: '历史存盘周期', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'datasource', label: '数据源', width: 160, type: 'text', condition: 'isTransfer'},
            {prop: 'mqttkey', label: 'MqttKey', width: 160, type: 'text'},
        ],
    },
    digital: {
        columns: [
            {prop: 'index', label: '序号', width: 80, fixed: true},
            {prop: 'id', label: 'OID', width: 160},
            {prop: 'gin', label: '点号', width: 100, type: 'text'},
            {prop: 'register', label: '原始地址', width: 160, type: 'text'},
            {prop: 'name', label: '原始名', width: 160, type: 'text'},
            {prop: 'aliasname', label: '别名', width: 160, type: 'text', condition: 'isTransfer'},
            {prop: 'subtype', label: '遥信子类型', width: 160, type: 'select', selectOptions: yxsubtypeDict},
            {
                prop: 'datatype',
                label: '数据类型',
                width: 160,
                type: 'select',
                selectOptions: dataTypeDict,
                condition: '!isTransfer',
            },
            {prop: 'code', label: '功能码', width: 160, type: 'text'},
            {prop: 'bitoffset', label: '位偏移', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'negation', label: '取反', width: 160, type: 'text'},
            {prop: 'calculated', label: '计算点', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'manual', label: '人工置数点', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'enablewarning', label: '报警允许', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'trans', label: '是否转发', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'hisperiod', label: '历史存盘周期', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'datasource', label: '数据源', width: 160, type: 'text', condition: 'isTransfer'},
            {prop: 'mqttkey', label: 'MqttKey', width: 160, type: 'text'},
        ],
    },
    pulse: {
        columns: [
            {prop: 'index', label: '序号', width: 80, fixed: true},
            {prop: 'id', label: 'OID', width: 160},
            {prop: 'gin', label: '点号', width: 100, type: 'text'},
            {prop: 'register', label: '原始地址', width: 160, type: 'text'},
            {prop: 'name', label: '原始名', width: 160, type: 'text'},
            {prop: 'aliasname', label: '别名', width: 160, type: 'text', condition: 'isTransfer'},
            {prop: 'subtype', label: '遥脉子类型', width: 160, type: 'select', selectOptions: ymsubtypeDict},
            {
                prop: 'datatype',
                label: '数据类型',
                width: 160,
                type: 'select',
                selectOptions: dataTypeDict,
                condition: '!isTransfer',
            },
            {prop: 'code', label: '功能码', width: 160, type: 'text'},
            {prop: 'fullscalevalue', label: '满刻度值', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'coeff', label: '系数', width: 160, type: 'text'},
            {prop: 'unit', label: '单位', width: 160, type: 'text'},
            {prop: 'calculated', label: '计算点', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'manual', label: '人工置数点', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'trans', label: '是否转发', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'hisperiod', label: '历史存盘周期', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'datasource', label: '数据源', width: 160, type: 'text', condition: 'isTransfer'},
            {prop: 'mqttkey', label: 'MqttKey', width: 160, type: 'text'},
        ],
    },
    regulate: {
        columns: [
            {prop: 'index', label: '序号', width: 80, fixed: true},
            {prop: 'id', label: 'OID', width: 160},
            {prop: 'gin', label: '点号', width: 100, type: 'text'},
            {prop: 'register', label: '原始地址', width: 160, type: 'text'},
            {prop: 'name', label: '原始名', width: 160, type: 'text'},
            {prop: 'aliasname', label: '别名', width: 160, type: 'text', condition: 'isTransfer'},
            {
                prop: 'datatype',
                label: '数据类型',
                width: 160,
                type: 'select',
                selectOptions: dataTypeDict,
                condition: '!isTransfer',
            },
            {prop: 'code', label: '功能码', width: 160, type: 'text'},
            {prop: 'ctlmode', label: '控制模式', width: 160, type: 'select', selectOptions: ctrlModeDict},
            {prop: 'relateanalog', label: '相关遥测', width: 160, type: 'text'},
            {prop: 'coeff', label: '下发系数', width: 160, type: 'text'},
            {prop: 'uplimit', label: '遥调上限', width: 160, type: 'text'},
            {prop: 'lowlimit', label: '遥调下限', width: 160, type: 'text'},
            {prop: 'adjusttimeout', label: '遥调超时时间', width: 160, type: 'text'},
            {prop: 'trans', label: '是否转发', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'datasource', label: '数据源', width: 160, type: 'text', condition: 'isTransfer'},
            {prop: 'mqttkey', label: 'MqttKey', width: 160, type: 'text'},
        ],
    },
    control: {
        columns: [
            {prop: 'index', label: '序号', width: 80, fixed: true},
            {prop: 'id', label: 'OID', width: 160},
            {prop: 'gin', label: '点号', width: 100, type: 'text'},
            {prop: 'register', label: '原始地址', width: 160, type: 'text'},
            {prop: 'name', label: '原始名', width: 160, type: 'text'},
            {prop: 'aliasname', label: '别名', width: 160, type: 'text', condition: 'isTransfer'},
            {
                prop: 'datatype',
                label: '数据类型',
                width: 160,
                type: 'select',
                selectOptions: dataTypeDict,
                condition: '!isTransfer',
            },
            {prop: 'code', label: '功能码', width: 160, type: 'text'},
            {prop: 'ctlmode', label: '控制模式', width: 160, type: 'select', selectOptions: ctrlModeDict},
            {prop: 'relatedigital', label: '相关遥信', width: 160, type: 'text'},
            {prop: 'controltimeout', label: '遥控超时时间', width: 160, type: 'text'},
            {prop: 'trans', label: '是否转发', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'datasource', label: '数据源', width: 160, type: 'text', condition: 'isTransfer'},
            {prop: 'mqttkey', label: 'MqttKey', width: 160, type: 'text'},
        ],
    },
    attribute: {
        columns: [
            {prop: 'index', label: '序号', width: 80, fixed: true},
            {prop: 'id', label: 'OID', width: 160},
            {prop: 'gin', label: '点号', width: 100, type: 'text'},
            {prop: 'name', label: '原始名', width: 280, type: 'text'},
            {prop: 'valuetype', label: '值类型', width: 200, type: 'select', selectOptions: attributeTypeDict},
            {prop: 'trans', label: '是否转发', width: 160, type: 'text', condition: '!isTransfer'},
            {prop: 'hisperiod', label: '历史存盘周期', width: 220, type: 'text', condition: '!isTransfer'},
            {prop: 'datasource', label: '数据源', width: 240, type: 'text', condition: 'isTransfer'},
            {prop: 'mqttkey', label: 'MqttKey', width: 240, type: 'text'},
        ],
    },
};
