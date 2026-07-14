import {ColorType} from '@/common/dict';

interface Status {
    colorType: ColorType;
    value: string;
}
export interface StatusDict {
    [key: string]: Status;
}
export const alarmStatus: StatusDict = {
    // 正常
    '0': {
        colorType: ColorType.NORMAL,
        value: 'fw.deviceStatus.normal',
    },
    // 告警
    '1': {
        colorType: ColorType.ERROR,
        value: 'fw.deviceStatus.alarm',
    },
};
export const commonStatus: StatusDict = {
    // 正常
    '0': {
        colorType: ColorType.NORMAL,
        value: 'fw.deviceStatus.normal',
    },
    // 故障
    '1': {
        colorType: ColorType.ERROR,
        value: 'fw.deviceStatus.fault',
    },
};

export const communicationStatus: StatusDict = {
    // 离线
    '1': {
        colorType: ColorType.ERROR,
        value: `fw.deviceStatus.offline`,
    },
    // 在线
    '2': {
        colorType: ColorType.SUCCESS,
        value: `fw.deviceStatus.online`,
    },
};

export const doorStatus: StatusDict = {
    // 门关闭
    '1': {
        colorType: ColorType.NORMAL,
        value: 'fw.deviceStatus.doorClosed',
    },
    // 门打开
    '0': {
        colorType: ColorType.ERROR,
        value: 'fw.deviceStatus.doorOpened',
    },
};

export const scramButtonStatus: StatusDict = {
    // 按下
    '1': {
        colorType: ColorType.ERROR,
        value: 'fw.deviceStatus.pressed',
    },
    // 未按下
    '0': {
        colorType: ColorType.NORMAL,
        value: 'fw.deviceStatus.notPressed',
    },
};
