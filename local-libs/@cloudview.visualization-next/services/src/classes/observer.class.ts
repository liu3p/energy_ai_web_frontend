type CallBackFunction = (...args: any) => void;

export class Observer {
    private _subscribes: Map<string | symbol, CallBackFunction[]> = new Map();

    on(message: string | symbol, callback: CallBackFunction) {
        if (!this._subscribes.has(message)) {
            this._subscribes.set(message, []);
        }

        this._subscribes.get(message)!.push(callback);
        return callback;
    }

    dispatch(message: string | symbol, ...args: unknown[]) {
        if (this._subscribes.has(message)) {
            this._subscribes.get(message)!.forEach(callback => {
                callback(...args);
            });
        }
    }

    off(message: string | symbol, callback: CallBackFunction) {
        if (this._subscribes.has(message)) {
            const callbacks = this._subscribes.get(message);
            const index = callbacks!.indexOf(callback);
            if (index !== -1) {
                callbacks!.splice(index, 1);
            }
        }
    }

    offAll(message: string | symbol) {
        if (this._subscribes.has(message)) {
            this._subscribes.set(message, []);
        }
    }
}
