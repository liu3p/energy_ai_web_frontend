import {nextTick} from 'vue';
import {WebsocketDataModel} from '@/common/websocket/websocket-data.model';
import {Locale} from '../locale';
type MessageHandler = (data: WebsocketDataModel | string) => void;

export class WebsocketClass {
    private webSocket: WebSocket | null = null;
    private activeClose = false;
    private reconnectTime = 0;
    private reconnectMaxTime = 10;
    private reconnectInterval = 5000;
    private handlers: MessageHandler[] = [];
    private subscribedItems = new Set<string>();

    constructor(
        private url: string,
        private refreshToken: () => void,
        private getToken: () => {tokenType: string | null; token: string | null}
    ) {}

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
        this.webSocket = new WebSocket(`${this.url}?authorization=${tokenType} ${token}`);
        this.webSocket.onopen = () => {
            this.reconnectTime = 0;
            this.subscribedItems.forEach(itemId => {
                this.subscribeItem(itemId);
            });
        };
        this.webSocket.onmessage = (event: MessageEvent) => {
            this.handlers.forEach(handler => handler(event.data));
        };
        // this.webSocket.onerror = (event: Event) => {
        //     if (!this.activeClose) {
        //         this.reconnect();
        //     }
        // };
        this.webSocket.onclose = async (event: CloseEvent) => {
            if (!this.activeClose && event.code !== 1000 && event.code !== 1005) {
                CvMessage.error((Locale.locale as any)['fw']['common']['connectError']);
            }
            if (event.reason === '401011') {
                await this.refreshToken?.();
            }
            if (!this.activeClose && event.code !== 1000) {
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
        if (!this.webSocket) {
            console.error('WebSocket is not connected');
            return;
        }
        this.activeClose = true;
        this.reconnectTime = 0;
        this.webSocket.close();
        this.webSocket = null;
        this.handlers = [];
        this.subscribedItems.clear();
    }
}
