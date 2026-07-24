import type {InjectionKey, Ref} from 'vue';
import type {IGlobalConfigType} from '../types';

export const configProviderContextKey: InjectionKey<Ref<IGlobalConfigType>> = Symbol();
