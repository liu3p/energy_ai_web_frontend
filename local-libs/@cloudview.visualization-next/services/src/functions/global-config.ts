import type {IGlobalConfigType} from '../types';
import {configProviderContextKey} from '../tokens';
import {type App, computed, getCurrentInstance, inject, provide, type Ref, ref, type ComputedRef, watch} from 'vue';
import {StringUtils} from '../tools';
import {debugWarn, throwError} from './error';
import {ExtendedHttp} from '../classes/http.class';

const globalConfig = ref<IGlobalConfigType>();

export function useGlobalConfig<K extends keyof IGlobalConfigType, D extends IGlobalConfigType[K]>(
    key: K,
    defaultValue?: D
): Ref<Exclude<IGlobalConfigType[K], undefined> | D>;

export function useGlobalConfig(): Ref<IGlobalConfigType>;

export function useGlobalConfig(key?: keyof IGlobalConfigType, defaultValue = undefined) {
    const config = getCurrentInstance() ? inject(configProviderContextKey, globalConfig) : globalConfig;
    if (key) {
        return computed(() => {
            return config.value?.[key] ?? defaultValue;
        });
    }
    return config;
}

const mergeConfig = (a: IGlobalConfigType, b: IGlobalConfigType): IGlobalConfigType => {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    const obj = {};
    for (const key of keys) {
        obj[key] = b[key] ?? a[key];
    }
    return obj as IGlobalConfigType;
};

const validateOptions = (config: IGlobalConfigType): void => {
    if (config.http === null) {
        throwError('provideGlobalConfig', "Property 'http' in options cannot be null or undefined");
    }
    if (StringUtils.isEmpty(config.vnbId)) {
        debugWarn('provideGlobalConfig', 'Property vnbId in options cannot be empty');
    }
};

export const provideGlobalConfig = (config: ComputedRef<IGlobalConfigType>, app?: App, global = false) => {
    const cfg = config;

    validateOptions(cfg.value);

    const inSetup = !!getCurrentInstance();
    const oldConfig = inSetup ? {...useGlobalConfig()} : undefined;

    const provideFn = app?.provide ?? (inSetup ? provide : undefined);
    if (!provideFn) {
        debugWarn('provideGlobalConfig', 'Function provideGlobalConfig() can only used inside setup()');
        return;
    }
    const context = computed(() => {
        if (!oldConfig?.value) {
            return Object.assign({}, cfg.value, {http: new ExtendedHttp(cfg.value.http!, cfg.value.camelToSnake)});
        }
        const res = mergeConfig(oldConfig.value, cfg.value);
        res.http = new ExtendedHttp(res.http!, res.camelToSnake);
        return res;
    });
    provideFn(configProviderContextKey, context);
    watch(
        () => context,
        () => {
            globalConfig.value = context.value;
        },
        {deep: true, immediate: true}
    );
    return context;
};
