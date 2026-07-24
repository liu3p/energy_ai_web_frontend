import {Utils} from '../tools';

class ErrorVis extends Error {
    constructor(m: string) {
        super(m);
        this.name = 'VisualizationError';
    }
}

export function throwError(scope: string, m: string): never {
    throw new ErrorVis(`[${scope}] ${m}`);
}

export function debugWarn(err: Error): void;
export function debugWarn(scope: string, message: string): void;
export function debugWarn(scope: string | Error, message?: string): void {
    if (process.env.NODE_ENV !== 'production') {
        const error: Error = Utils.isString(scope) ? new ErrorVis(`[${scope}] ${message}`) : scope;
        console.warn(error);
    }
}
