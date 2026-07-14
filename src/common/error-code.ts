export function getErrorCodeTips(code?: number | string) {
    if (code) {
        return 'fw.common.codeError' + code;
    } else {
        return 'fw.common.operateFail';
    }
}
