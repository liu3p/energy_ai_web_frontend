import type {Ref} from 'vue';

export interface IPagination {
    page: number;
    page_size: number;
    total_count: number;
}

export interface IPaginationData<T> {
    data: T;
    pagination: IPagination;
}

export interface IObject {
    content: string;
    id: string;
    filename: string;
}

export interface IObjectRes {
    id: string;
}

export type MaybeRef<T> = T | Ref<T>;

export interface ITreeNode<T> {
    id: number;
    level: number;
    isLeaf: boolean;
    isCurrent: boolean;
    expanded: boolean;
    indeterminate: boolean;
    loaded: boolean;
    loading: boolean;
    parent: ITreeNode<T> | null;
    text: string | null;
    visible: boolean;
    childNodes: ITreeNode<T>[];
}

export interface IImportPreviewItem {
    id: string;
    name: string;
    tag: string;
    thumbnail: string;
    conflict: boolean;
}
