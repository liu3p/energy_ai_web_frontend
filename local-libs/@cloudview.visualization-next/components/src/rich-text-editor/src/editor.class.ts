export class Editor {
    el: Element;
    currentRange: Range | null;

    constructor(el) {
        this.el = el;
        this.currentRange = null;
        document.execCommand('styleWithCSS', false, '');
        this.saveRangeRealTime();
    }

    restoreRange() {
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            if (this.currentRange) {
                selection.addRange(this.currentRange);
            }
        }
    }

    saveRange(range?: Range) {
        if (range) {
            this.currentRange = range;
            return;
        }
        // 获取当前的选区
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }
        range = selection!.getRangeAt(0);

        // 判断选区内容是否在编辑内容之内
        const $containerElem = this.getSelectionContainerElem(range);
        if (!$containerElem) {
            return false;
        }

        if (this.el.contains($containerElem)) {
            this.currentRange = range;
        }
    }

    saveRangeRealTime() {
        // 保存当前的选区
        const saveRange = e => {
            this.saveRange();
        };
        // 按键后保存
        this.el.addEventListener('keyup', saveRange);
        this.el.addEventListener('mousedown', e => {
            // mousedown 状态下，鼠标滑动到编辑区域外面，也需要保存选区
            this.el.addEventListener('mouseleave', saveRange);
        });
        this.el.addEventListener('mouseup', e => {
            saveRange(e);
            // 在编辑器区域之内完成点击，取消鼠标滑动到编辑区外面的事件
            this.el.removeEventListener('mouseleave', saveRange);
        });
    }

    doCommand(name: string, value?) {
        if (!this.currentRange) {
            return false;
        }
        this.restoreRange();
        this.execCommand(name, value);
        this.saveRange();
        this.restoreRange();
    }

    execCommand(name, value) {
        if (document.queryCommandSupported(name)) {
            document.execCommand(name, false, value);
        } else {
            switch (name) {
                case 'insertHTML':
                    if (this.currentRange?.insertNode) {
                        this.currentRange.insertNode(Editor.html2dom(value)[0]);
                    }
                    break;
                default:
            }
        }
    }

    // 选区的 $Elem
    getSelectionContainerElem(range?: Range) {
        const theRange = range || this.currentRange;
        let elem;
        if (theRange) {
            elem = theRange.commonAncestorContainer;
            return elem.nodeType === 1 ? elem : elem.parentNode;
        }
    }

    static async getPlaceHolder(content) {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 40;
        const ctx = canvas.getContext('2d')!;
        ctx.font = '28px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText(content, 0, 28);
        return canvas.toDataURL();
    }

    static html2dom(html) {
        const el = document.createElement('div');
        el.innerHTML = html;
        return el.childNodes;
    }
}
