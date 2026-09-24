import {nextTick} from 'vue';
import {WebsocketDataModel} from '@/common/websocket/websocket-data.model';
import {Locale} from '../locale';

type MessageHandler = (data: WebsocketDataModel | string) => void;
type OpenHandler = () => void;
type CloseHandler = (event: CloseEvent) => void;

export type WebsocketOptions = {
    /** 默认 true；日志推送等场景可关闭，避免异常断线后反复重连 */
    autoReconnect?: boolean;
};

async function normalizeMessageData(data: unknown): Promise<string | WebsocketDataModel> {
    if (typeof data === 'string') {
        return data;
    }
    if (data instanceof ArrayBuffer) {
        return new TextDecoder('utf-8', {fatal: false}).decode(data);
    }
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
        const buffer = await data.arrayBuffer();
        return new TextDecoder('utf-8', {fatal: false}).decode(buffer);
    }
    return String(data ?? '');
}

export class WebsocketClass {
    private webSocket: WebSocket | null = null;
    private activeClose = false;
    private reconnectTime = 0;
    private reconnectMaxTime = 10;
    private reconnectInterval = 5000;
    private handlers: MessageHandler[] = [];
    private openHandlers: OpenHandler[] = [];
    private closeHandlers: CloseHandler[] = [];
    private subscribedItems = new Set<string>();
    private autoReconnect: boolean;

    constructor(
        private url: string,
        private refreshToken: () => void,
        private getToken: () => {tokenType: string | null; token: string | null},
        options?: WebsocketOptions
    ) {
        this.autoReconnect = options?.autoReconnect !== false;
    }

    onMessage(callback: MessageHandler) {
        nextTick(() => {
            this.handlers.push(callback);
        });
        return () => {
            this.offMessage(callback);
        };
    }

    offMessage(callback: MessageHandler) {
        this.handlers = this.handlers.filter(handler => handler !== callback);
    }

    onOpen(callback: OpenHandler) {
        this.openHandlers.push(callback);
        return () => {
            this.offOpen(callback);
        };
    }

    offOpen(callback: OpenHandler) {
        this.openHandlers = this.openHandlers.filter(handler => handler !== callback);
    }

    onClose(callback: CloseHandler) {
        this.closeHandlers.push(callback);
        return () => {
            this.offClose(callback);
        };
    }

    offClose(callback: CloseHandler) {
        this.closeHandlers = this.closeHandlers.filter(handler => handler !== callback);
    }

    subscribeItem(itemId: string) {
        if (!this.webSocket) {
            console.error('WebSocket is not connected');
            return;
        }
        nextTick(() => {
            this.subscribedItems.add(itemId);
            if (this.webSocket?.readyState === WebSocket.OPEN) {
                this.webSocket.send(JSON.stringify({topic: 'subscribeItem', site_id: itemId}));
            }
        });
    }

    unSubscribeItem(itemId: string) {
        if (!this.webSocket) {
            console.error('WebSocket is not connected');
            return;
        }
        this.subscribedItems.delete(itemId);
        if (this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(JSON.stringify({topic: 'unSubscribeItem', site_id: itemId}));
        }
    }

    send(data: string | object): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.webSocket) {
                reject(new Error('WebSocket is not connected'));
                return;
            }

            if (this.webSocket.readyState !== WebSocket.OPEN) {
                reject(new Error('WebSocket is not open. ReadyState: ' + this.webSocket.readyState));
                return;
            }

            try {
                const message = typeof data === 'string' ? data : JSON.stringify(data);
                this.webSocket.send(message);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    connect() {
        const {tokenType, token} = this.getToken();
        if (!token) {
            return;
        }
        this.activeClose = false;
        // 避免重复 connect 时残留旧连接
        if (this.webSocket) {
            const prev = this.webSocket;
            prev.onopen = null;
            prev.onmessage = null;
            prev.onclose = null;
            prev.onerror = null;
            try {
                prev.close();
            } catch {
                /* ignore */
            }
            this.webSocket = null;
        }
        this.webSocket = new WebSocket(`${this.url}?authorization=${tokenType} ${token}`);
        this.webSocket.binaryType = 'arraybuffer';
        this.webSocket.onopen = () => {
            this.reconnectTime = 0;
            this.openHandlers.forEach(handler => handler());
            this.subscribedItems.forEach(itemId => {
                this.subscribeItem(itemId);
            });
        };
        this.webSocket.onmessage = (event: MessageEvent) => {
            void normalizeMessageData(event.data).then(payload => {
                this.handlers.forEach(handler => handler(payload));
            });
        };
        this.webSocket.onclose = async (event: CloseEvent) => {
            this.closeHandlers.forEach(handler => handler(event));
            if (!this.activeClose && event.code !== 1000 && event.code !== 1005) {
                CvMessage.error((Locale.locale as any)['fw']['common']['connectError']);
            }
            if (event.reason === '401011') {
                await this.refreshToken?.();
            }
            if (this.autoReconnect && !this.activeClose && event.code !== 1000) {
                this.reconnect();
            }
        };
    }

    reconnect() {
        if (!this.activeClose && this.reconnectTime < this.reconnectMaxTime) {
            this.reconnectTime++;
            const delay = Math.min(Math.ceil(this.reconnectTime / 3) * this.reconnectInterval, 30000);
            console.log(`WebSocket reconnecting in ${delay}ms (attempt ${this.reconnectTime})`);
            setTimeout(() => {
                this.connect();
            }, delay);
        }
    }

    close() {
        this.activeClose = true;
        this.reconnectTime = 0;
        if (this.webSocket) {
            this.webSocket.onopen = null;
            this.webSocket.onmessage = null;
            this.webSocket.onclose = null;
            this.webSocket.onerror = null;
            try {
                this.webSocket.close();
            } catch {
                /* ignore */
            }
            this.webSocket = null;
        }
        this.handlers = [];
        this.openHandlers = [];
        this.closeHandlers = [];
        this.subscribedItems.clear();
    }
}
