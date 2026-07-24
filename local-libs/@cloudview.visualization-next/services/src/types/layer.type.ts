import type {IPrimitiveInstance} from '../types';

export interface ILayer {
    id: string;
    index: number;
    invisible?: boolean;
    locked?: boolean;
    selected?: boolean;
    elements: IPrimitiveInstance[];
}
