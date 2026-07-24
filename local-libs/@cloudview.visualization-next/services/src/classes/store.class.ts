import type {MaybeRef} from '../types';
import {unref} from 'vue';

export class Store {
    private state = new Map<string | number | symbol, any>();

    commit<T>(key: string | number | symbol, value: MaybeRef<T>) {
        this.state.set(key, unref(value));
    }

    get<T>(key: string | number | symbol): T | null {
        if (this.state.has(key)) {
            return this.state.get(key);
        }
        return null;
    }
}

export const store = new Store();
