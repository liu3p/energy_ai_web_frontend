import type {ILayer} from '../types';
import {IdUtils} from '../tools';
import type {PrimitiveInstance} from './instance-primitive.class';
import {PrimitiveInstanceFactory} from './instance-primitive-factory.class';

export class Layer implements ILayer {
    id: string;
    index: number;
    invisible = false;
    locked = false;
    selected?: boolean = false;
    elements: PrimitiveInstance[];
    reverseElements?: PrimitiveInstance[];

    constructor(layer?: ILayer | null) {
        this.id = layer?.id ?? IdUtils.genLayerId();
        this.index = layer?.index ?? 0;
        this.invisible = layer?.invisible ?? false;
        this.locked = layer?.locked ?? false;
        this.elements = (layer?.elements ?? []).map(element => PrimitiveInstanceFactory.getInstance(element, this));
    }

    getConfig(): ILayer {
        return {
            id: this.id,
            index: this.index,
            invisible: this.invisible,
            locked: this.locked,
            elements: this.elements.map(element => element.getConfig()),
        };
    }

    setSelected(selected: boolean): void {
        this.selected = selected;
    }

    setLocked(locked: boolean) {
        this.locked = locked;
    }

    setInvisible(invisible: boolean) {
        this.invisible = invisible;
    }
}
