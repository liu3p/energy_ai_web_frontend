import {v4 as uuid} from 'uuid';
import type {IStatusInfo} from '../types';
import {InsertValuePrefix, systemNames} from '../tokens';
import type {PrimitiveInstance} from '../classes/instance-primitive.class';

let systemName: symbol;

export class Utils {
    static getPromise<T>(): [Promise<T>, (param: T) => T, () => void] {
        let resolve, reject;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return [promise, resolve, reject];
    }

    static isArray(target: any): boolean {
        return Array.isArray(target);
    }

    static isObject(target: any): boolean {
        return Object.prototype.toString.call(target) === '[object Object]';
    }

    static isNull(target: any): target is null {
        return Object.prototype.toString.call(target) === '[object Null]';
    }

    static isNumber(target: any): target is number {
        return Object.prototype.toString.call(target) === '[object Number]';
    }

    static isString(target: any): target is string {
        return Object.prototype.toString.call(target) === '[object String]';
    }

    static isBoolean(target: any): target is boolean {
        return Object.prototype.toString.call(target) === '[object Boolean]';
    }

    static isUndefined(target: any): target is undefined {
        return Object.prototype.toString.call(target) === '[object Undefined]';
    }

    static isFunction(target: any): boolean {
        return typeof target === 'function';
    }

    static isRegExp(target: any): boolean {
        return Object.prototype.toString.call(target) === '[object RegExp]';
    }

    static isDate(target: any): boolean {
        return Object.prototype.toString.call(target) === '[object Date]';
    }

    static isSymbol(target: any): boolean {
        return Object.prototype.toString.call(target) === '[object Symbol]';
    }

    static isError(target: any): boolean {
        return Object.prototype.toString.call(target) === '[object Error]';
    }

    static isType(target: any, typeName: string): boolean {
        return Object.prototype.toString.call(target) === `[object ${typeName}`;
    }

    static camelToSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    static formatDecimal(value: number, digit = 2): number {
        return Math.round(value * 10 ** digit) / 10 ** digit;
    }

    /*
     *  对象的深拷贝，返回一个与目标对象相同的新对象
     */
    static deepClone(target: any): any {
        let res: any;
        if (this.isArray(target)) {
            res = [];
            for (let i = 0; i < target.length; i++) {
                res[i] = this.deepClone(target[i]);
            }
        } else if (this.isObject(target)) {
            res = {};
            const keys = Object.keys(target);
            for (let i = 0; i < keys.length; i++) {
                res[keys[i]] = this.deepClone(target[keys[i]]);
            }
        } else {
            res = target;
        }
        return res;
    }

    /*
     *  对象的深度合并，支持多参
     */
    static deepAssign(target: any, ...sources: any[]): any {
        if (sources.length === 0) {
            return target;
        }
        const source = sources.shift();
        if (
            (this.isArray(target) && !this.isArray(source) && !this.isObject(source)) ||
            (!this.isArray(target) && !this.isObject(target) && (this.isArray(source) || this.isObject(source))) ||
            (this.isObject(target) && !this.isArray(source) && !this.isObject(source))
        ) {
            return this.deepAssign(Object.assign(target, source), ...sources);
        }
        if (this.isArray(target) && this.isArray(source)) {
            const minLen = target.length <= source.length ? target.length : source.length;
            for (let i = 0; i < minLen; i++) {
                target[i] = this.deepAssign(target[i], source[i]);
            }
            if (target.length < source.length) {
                for (let i = minLen; i < source.length; i++) {
                    target.push(this.deepClone(source[i]));
                }
            }
            return this.deepAssign(target, ...sources);
        }
        if (this.isArray(target) && this.isObject(source)) {
            const keys = Object.keys(source);
            for (let i = 0; i < keys.length; i++) {
                if (i < target.length) {
                    target[i] = this.deepAssign(target[i], source[i]);
                }
            }
            return this.deepAssign(Object.assign(target, source), ...sources);
        }
        if (this.isObject(target) && this.isArray(source)) {
            for (let i = 0; i < source.length; i++) {
                if (i in target) {
                    target[i] = this.deepAssign(target[i], source[i]);
                }
            }
            return this.deepAssign(Object.assign(target, source), ...sources);
        }
        if (this.isObject(target) && this.isObject(source)) {
            const keys = Object.keys(source);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] in target) {
                    target[keys[i]] = this.deepAssign(target[keys[i]], source[keys[i]]);
                } else {
                    target[keys[i]] = this.deepClone(source[keys[i]]);
                }
            }
            return this.deepAssign(target, ...sources);
        }
        return this.deepAssign(source, ...sources);
    }

    static svgString2Base64Img(str: string): string {
        return 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(str)));
    }

    static base64Image2SvgString(base64: string): string {
        return window.atob(base64.replace('data:image/svg+xml;base64,', ''));
    }

    static async image2Base64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = e => {
                resolve(e.target?.result as string);
            };
        });
    }

    static async readSvgFile(file: File): Promise<string> {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = e => {
                resolve(e.target?.result as string);
            };
        });
    }

    static parseTemplate(template: string, primitive: PrimitiveInstance): string {
        return template.replace(/{{(.+?)}}/g, function (pattern, key) {
            return primitive.getAttribute(key)?.toString() || '';
        });
    }

    static fullscreenSupport() {
        let isSupport = false,
            prefix = '';
        // 判断浏览器前缀
        if (document.fullscreenEnabled) {
            isSupport = document.fullscreenEnabled;
        } else if ((document as any).webkitFullscreenEnabled) {
            isSupport = (document as any).webkitFullscreenEnabled;
            prefix = 'webkit';
        } else if ((document as any).mozFullScreenEnabled) {
            isSupport = (document as any).mozFullScreenEnabled;
            prefix = 'moz';
        } else if ((document as any).msFullscreenEnabled) {
            isSupport = (document as any).msFullscreenEnabled;
            prefix = 'ms';
        }
        return {isSupport, prefix};
    }

    static download(data: string | Blob, fileName: string): void {
        let url: string;
        if (typeof data === 'string') {
            url = data;
        } else {
            url = URL.createObjectURL(data);
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    static screenShotSvg(svg: HTMLElement, isEdit = false): Promise<[Error | null, HTMLCanvasElement | undefined]> {
        const canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            image = new Image();

        // the fix for firefox
        svg.setAttribute('width', svg.clientWidth + 'px');
        svg.setAttribute('height', svg.clientHeight + 'px');

        const svgXml = new XMLSerializer().serializeToString(svg);
        image.src = 'data:image/svg+xml;utf-8,' + encodeURIComponent(svgXml);

        image.style.display = 'none';
        document.body.appendChild(image);

        return new Promise((resolve, reject) => {
            image.onload = () => {
                canvas.width = svg.clientWidth;
                canvas.height = svg.clientHeight;

                if (!isEdit) {
                    // the fix for firefox
                    svg.removeAttribute('width');
                    svg.removeAttribute('height');
                }
                context!.fillStyle = '#ffffff';
                context!.fillRect(0, 0, canvas.width, canvas.height);
                context!.drawImage(image, 0, 0, canvas.width, canvas.height);
                document.body.removeChild(image);
                resolve([null, canvas]);
            };
            image.onerror = error => {
                reject([error]);
            };
        });
    }

    static canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> | undefined {
        if (canvas.toBlob) {
            return new Promise(resolve => {
                canvas.toBlob(blob => {
                    resolve(blob);
                });
            });
        } else if ((canvas as any).msToBlob) {
            return (canvas as any).msToBlob();
        }
    }

    static getRotateAnglePos(x, y, reverseTheta, centerX, centerY) {
        const newX = (x - centerX) * Math.cos(reverseTheta) + (y - centerY) * Math.sin(reverseTheta) + centerX;
        const newY = -1 * (x - centerX) * Math.sin(reverseTheta) + (y - centerY) * Math.cos(reverseTheta) + centerY;
        return {x: newX, y: newY};
    }

    static getRealRotate(rotate = 0) {
        const remain = rotate % 360;
        return remain >= 0 ? remain : remain + 360;
    }

    static getSystemName() {
        if (systemName) return systemName;
        if (window.navigator.userAgent.includes('Mac')) {
            systemName = systemNames.MAC;
        } else if (window.navigator.userAgent.includes('Windows')) {
            systemName = systemNames.WINDOWS;
        } else {
            systemName = systemNames.OTHER;
        }
        return systemName;
    }

    static useWin() {
        return Utils.getSystemName() === systemNames.WINDOWS || Utils.getSystemName() === systemNames.OTHER;
    }

    static useMac() {
        return Utils.getSystemName() === systemNames.MAC || Utils.getSystemName() === systemNames.OTHER;
    }

    // 求三个坐标点的夹角
    static getRotateAngle(x1, y1, x2, y2, x3, y3) {
        let factor = -1;
        const alpha = Math.atan2(y2 - y1, x2 - x1);
        const vPosLeftTop = this.getRotateAnglePos(x1, y1, alpha, x2, y2);
        const vPosMouse = this.getRotateAnglePos(x3, y3, alpha, x2, y2);
        if (vPosLeftTop.y < vPosMouse.y) {
            factor = 1;
        } else if (vPosLeftTop.y === vPosMouse.y) {
            factor = 0;
        }
        const a = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        const b = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2));
        const c = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
        return this.formatDecimal((Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180) / Math.PI, 0) * factor;
    }
}

export class StringUtils {
    static isEmpty(str: string | null | undefined): boolean {
        return str === undefined || str === null || str.length === 0;
    }
}

export class IdUtils {
    static genLayerId() {
        return `layer_${uuid().replaceAll('-', '')}`;
    }

    static genPrimitiveId() {
        return `primitive_${uuid().replaceAll('-', '')}`;
    }

    static genBoardId() {
        return `board_${uuid().replaceAll('-', '')}`;
    }

    static getInsertValueId() {
        return `${InsertValuePrefix}${uuid().replaceAll('-', '')}`;
    }
}

export class SvgUtils {
    static getImgSrc(g, svg) {
        const nodes = svg.children ? Array.from(svg.children) : Array.from(svg.childNodes);
        for (let i = nodes.length - 1; i >= 0; i--) {
            svg.removeChild(nodes[i]);
        }
        svg.appendChild(g);
        const html = svg.outerHTML;
        return Utils.svgString2Base64Img(html);
    }

    static parse(model) {
        let f: DocumentFragment | SVGSVGElement = document.createDocumentFragment();
        const div = document.createElement('div');
        let full = true;
        let svgStr = String(model);

        if (!svgStr.match(/^\s*<\s*svg(?:\s|>)/)) {
            svgStr = '<svg>' + svgStr + '</svg>';
            full = false;
        }
        div.innerHTML = svgStr;
        const svg = div.getElementsByTagName('svg')[0];
        if (svg) {
            if (full) {
                f = svg;
            } else {
                while (svg.firstChild) {
                    f.appendChild(svg.firstChild);
                }
            }
        }
        return {
            node: f,
        };
    }

    static getStatusList(nodeData): IStatusInfo[] {
        const statusList: IStatusInfo[] = [];
        let index = 0;
        if (nodeData) {
            if (nodeData.node.nodeName === 'svg') {
                const nodes = nodeData.node.children
                    ? Array.from(nodeData.node.children)
                    : Array.from(nodeData.node.childNodes);
                nodes.forEach((dom: any) => {
                    if (dom.nodeName === 'g') {
                        statusList.push({
                            name: '状态' + index,
                            index,
                            src: this.getImgSrc(dom.cloneNode(true), nodeData.node.cloneNode(true)),
                        });
                        index++;
                    }
                });
            } else {
                const nodes = nodeData.node.children
                    ? Array.from(nodeData.node.children)
                    : Array.from(nodeData.node.childNodes);
                nodes.some((dom: any) => {
                    if (dom.nodeName === 'svg') {
                        const children = dom.children ? Array.from(dom.children) : Array.from(dom.childNodes);
                        Array.from(children).forEach((item: any) => {
                            if (item.nodeName === 'g') {
                                statusList.push({
                                    name: '状态' + index,
                                    index,
                                    src: this.getImgSrc(item.cloneNode(true), dom.cloneNode(true)),
                                });
                                index++;
                            }
                        });
                        return true;
                    }
                });
            }
        }
        return statusList;
    }
}
