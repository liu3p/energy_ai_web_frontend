import * as XLSX from 'xlsx';
/**
 * 读取excel内容
 * @param {*} file
 * @returns
 */
export const readExcel = <T, K extends string>(file: File) => {
    return new Promise((resolve, reject) => {
        try {
            //获取上传对象
            const fileReader = new FileReader();
            fileReader.onload = event => {
                const fileData = event.target!.result;
                //读取excel文件
                const workboot = XLSX.read(fileData, {
                    type: 'binary',
                });
                const blockArrMap: {[key in K]: T[]} = readSheetFile(workboot);
                resolve(blockArrMap);
            };
            fileReader.readAsBinaryString(file);
        } catch (e) {
            reject(e);
        }
    });
};
const readSheetFile = (workboot: XLSX.WorkBook) => {
    const sheels = workboot.SheetNames;
    const blockMap: any = {};
    sheels.forEach(sheel => {
        const sheet = workboot.Sheets[sheel];
        const data = XLSX.utils.sheet_to_json(sheet);
        blockMap[sheel] = data;
    });
    return blockMap;
};
