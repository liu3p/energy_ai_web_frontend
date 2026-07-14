export default class Utils {
    /*
     * 下载文件的方法
     * @param: resData, 请求返回的数据
     * @param: filename, 文件名
     * */
    static download(resData: Blob, filename: string) {
        // @ts-ignore
        if (this.isFunction(navigator.msSaveOrOpenBlob)) {
            // @ts-ignore
            navigator.msSaveOrOpenBlob(resData, filename);
        } else {
            const a = document.createElement('a');
            a.download = filename;
            a.href = URL.createObjectURL(resData);
            document.body.appendChild(a);
            a.style.display = 'none';
            a.click();
            document.body.removeChild(a);
        }
    }

    // 校验用户名是否正确，大小写字母+数字 长度[4,32]
    static validateUserName(value: string): boolean {
        return new RegExp('^[A-Za-z0-9]{4,32}$').test(value);
    }

    // 校验是否是邮箱
    static validateEmail(value: string): boolean {
        return new RegExp('^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,4}$').test(value);
    }

    // 校验是否是手机号码
    static validateMobile(value: string): boolean {
        return new RegExp('^[1][3,4,5,7,8][0-9]{9}$').test(value);
    }

    // 校验用户姓名是否正确, 大小写字母，汉字，数字，长度[4,32]
    static validateNickName(value: string): boolean {
        //首先替换所有的中文汉字为两个字母，因为一个中文汉字算2个字符
        const replaceValue = value.replace(new RegExp('[\u4e00-\u9fa5]', 'g'), 'nn');

        return new RegExp('^[a-zA-Z0-9]{4,32}$').test(replaceValue);
    }

    // 校验版本号，大小写字母，数字，连词符'-',下划线'_',点'.',括号'()'，长度[4,32]
    static validateVersion(val: string): boolean {
        return new RegExp('^[a-zA-Z0-9-_.()]{4,32}$').test(val);
    }

    // 校验字符串，大小写，数字，汉字，连词符'-',下划线'_',点'.',括号'()'，长度[4,32]
    static validateTag(val: string): boolean {
        const res = val.replace(new RegExp('[\u4e00-\u9fa5]', 'g'), 'nn');
        return new RegExp('^[a-zA-Z0-9-_.()]{4,32}$').test(res);
    }

    // 校验字符串，大小写，数字，汉字，连词符'-',下划线'_',点'.',括号'()'，长度[1，60]
    static validateProp(val: string): boolean {
        const res = val.replace(new RegExp('[\u4e00-\u9fa5]', 'g'), 'nn');
        return new RegExp('^[a-zA-Z0-9-_.()]{1,60}$').test(res);
    }

    // 校验字符串，大小写字母+数字 长度[4,32]
    static validateKey(val: string): boolean {
        return new RegExp('^[a-zA-Z0-9]{4,32}$').test(val);
    }

    //校验密码是否符合规则（密码为6-16位英文（区分大小写）、数字、符号:-_.()，至少选择其中两种。）证
    static validatePassword(value: string): boolean {
        // 用来判断是否包含多个规则
        let matchNumber = 0;

        // 如果密码是在6-16,并且只包含数字，字母和特定符号时则继续校验
        if (!new RegExp('^[a-zA-Z0-9-_.()]{6,16}$').test(value)) {
            return false;
        }

        // 校验是否包含小写字母
        if (new RegExp('[a-z]').test(value)) {
            matchNumber++;
        }

        // 校验是否包含大写字母
        if (new RegExp('[A-Z]').test(value)) {
            matchNumber++;
        }

        // 校验是否包含数字
        if (new RegExp('[0-9]').test(value)) {
            matchNumber++;
        }

        // 校验是否包含特定符号
        if (new RegExp('[-_.()]').test(value)) {
            matchNumber++;
        }

        return matchNumber >= 2;
    }

    // 校验当前用户输入内容是否含有正斜杠和反斜杠
    static checkForwardAndBackSlash(val: string): boolean {
        const reg = /[/\\]/;
        return reg.test(val);
    }

    // 校验文件大小
    static validateFileSize(file: File, size: number): boolean {
        return file.size / 1024 / 1024 <= size;
    }

    // 文件大小格式化（B → KB/MB/GB）
    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 读文件
    static readFile(blob: Blob) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsText(blob);
            reader.onload = res => {
                resolve(res);
            };
        });
    }

    // 校验文件类型
    static validateFileType(file: File, types: string[]): boolean {
        const fileNameSplitList = file.name.split('.');
        let fileType = '';
        if (fileNameSplitList.length > 1) {
            fileType = fileNameSplitList[fileNameSplitList.length - 1].toLowerCase();
        }
        return types.some(type => type === fileType);
    }
}
