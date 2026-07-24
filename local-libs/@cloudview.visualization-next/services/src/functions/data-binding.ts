import type {IBinding} from '../types';

export const encodeInsertBinding = (binding: IBinding): string => {
    return window.btoa(encodeURIComponent(JSON.stringify(binding)));
};
export const decodeInsertBinding = (bindingString: string): IBinding => {
    return JSON.parse(decodeURIComponent(window.atob(bindingString)));
};
