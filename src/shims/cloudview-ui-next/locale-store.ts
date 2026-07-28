import {ref} from 'vue';

export const localeMessages = ref<Record<string, unknown>>({});

export function setLocaleMessages(messages: Record<string, unknown>) {
    localeMessages.value = messages;
}

export function translate(key: string): string {
    const keys = key.split('.');
    let val: unknown = localeMessages.value;
    for (const k of keys) {
        if (val && typeof val === 'object') {
            val = (val as Record<string, unknown>)[k];
        } else {
            return key;
        }
    }
    return typeof val === 'string' ? val : key;
}
