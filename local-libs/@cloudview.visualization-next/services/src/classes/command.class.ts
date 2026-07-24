import type {
    ICommandAddLayerParams,
    ICommandAddPrimitiveParams,
    ICommandCopyPrimitiveParams,
    ICommandLayerLockParams,
    ICommandLayerVisibleParams,
    ICommandMoveLayerParams,
    ICommandPrimitiveAttrParams,
    ICommandPrimitiveLockParams,
    ICommandPrimitiveResizeParams,
    ICommandPrimitiveRotateParams,
    ICommandPrimitiveVisibleParams,
    ICommandPrimitiveZIndexChangeParams,
    ICommandRemoveLayerParams,
    ICommandRemovePrimitiveParams,
    ICommandRemovePrimitivesParams,
} from '../types/command.type';
import type {PrimitiveInstance} from './instance-primitive.class';
import type {IAttributes, ILineAttr} from '../types/attr.type';
import {PrimitiveTypeAllEnum} from '@cloudview.visualization-next/services';

export abstract class Command<T> {
    protected before?: T;
    protected after?: T;

    public constructor(before?: T, after?: T) {
        this.before = before;
        this.after = after;
    }

    abstract undo(): void;
    abstract redo(): void;
}

export class CommandAddPrimitive extends Command<ICommandAddPrimitiveParams> {
    redo(): void {
        const {board, primitive} = this.after!;
        primitive.layer?.elements.push(primitive);
        primitive.setSelected(true);
        board.selectedPrimitives.forEach(p => p.setSelected(false));
        board.selectedPrimitives.length = 0;
        board.selectedPrimitives.push(primitive);
    }

    undo(): void {
        const {board, primitive} = this.after!;
        primitive.layer?.elements.splice(primitive.layer.elements.indexOf(primitive), 1);
        board.selectedPrimitives.forEach(p => p.setSelected(false));
        board.selectedPrimitives.length = 0;
    }
}

export class CommandRemovePrimitives extends Command<ICommandRemovePrimitivesParams> {
    redo(): void {
        const {board, primitives} = this.before!;
        board.selectedPrimitives.forEach(p => p.setSelected(false));
        board.selectedPrimitives.length = 0;
        primitives.forEach(primitive => {
            primitive.primitive.setSelected(false);
            primitive.primitive.layer?.elements.splice(
                primitive.primitive.layer.elements.indexOf(primitive.primitive),
                1
            );
        });
    }

    undo(): void {
        const {board, primitives} = this.before!;
        board.selectedPrimitives.forEach(p => p.setSelected(false));
        board.selectedPrimitives.length = 0;
        primitives.forEach(primitive => {
            board.selectedPrimitives.push(primitive.primitive);
            primitive.primitive.setSelected(true);
            primitive.primitive.layer?.elements.splice(primitive.index, 0, primitive.primitive);
        });
    }
}

export class CommandCopyPrimitive extends Command<ICommandCopyPrimitiveParams> {
    redo(): void {
        const {board, primitives} = this.after!;
        board.selectedPrimitives.forEach(p => p.setSelected(false));
        board.selectedPrimitives.length = 0;
        primitives.forEach(primitive => {
            primitive.layer?.elements.push(primitive);
            primitive.setSelected(true);
            board.selectedPrimitives.push(primitive);
        });
    }

    undo(): void {
        const {board, primitives} = this.after!;
        board.selectedPrimitives.forEach(p => p.setSelected(false));
        board.selectedPrimitives.length = 0;
        primitives.forEach(primitive => {
            primitive.layer!.elements.splice(primitive.layer!.elements.indexOf(primitive), 1);
            primitive.setSelected(false);
        });
    }
}

export class CommandAddLayer extends Command<ICommandAddLayerParams> {
    redo(): void {
        const {board, layer} = this.after!;
        board.selectedLayer?.setSelected(false);
        layer.setSelected(true);
        board.selectedLayer = layer;
        board.layers.push(layer);
    }

    undo(): void {
        const {board, layer} = this.after!;
        const {layer: beforeSelectLayer} = this.before!;
        layer.setSelected(false);
        board.selectedLayer = beforeSelectLayer;
        beforeSelectLayer.setSelected(true);
        board.layers.splice(board.layers.indexOf(layer), 1);
    }
}

export class CommandRemoveLayer extends Command<ICommandRemoveLayerParams> {
    redo(): void {
        const {board, selectedLayer} = this.after!;
        const {layer} = this.before!;
        board.selectedPrimitives.forEach(p => p.setSelected(false));
        board.selectedPrimitives.length = 0;
        board.layers.splice(board.layers.indexOf(layer!), 1);
        board.selectedLayer = selectedLayer!;
        selectedLayer!.setSelected(true);
        layer!.setSelected(false);
    }

    undo(): void {
        const {board, layer, index, selectedLayer} = this.before!;
        if (layer === selectedLayer) {
            board.selectedLayer?.setSelected(false);
            board.selectedLayer = layer;
            layer.setSelected(true);
        }
        board.layers.splice(index, 0, layer!);
        board.selectedPrimitives.forEach(p => p.setSelected(false));
        board.selectedPrimitives.length = 0;
    }
}

export class CommandRemovePrimitive extends Command<ICommandRemovePrimitiveParams> {
    redo(): void {
        const {board, primitive, selected, index} = this.before!;
        if (selected) {
            board.selectedPrimitives.splice(board.selectedPrimitives.indexOf(primitive), 1);
            primitive.setSelected(false);
        }
        primitive.layer!.elements.splice(index, 1);
    }

    undo(): void {
        const {board, primitive, index, selected} = this.before!;
        if (selected) {
            board.selectedPrimitives.push(primitive);
            primitive.setSelected(true);
        }
        primitive.layer!.elements.splice(index, 0, primitive);
    }
}

export class CommandMoveLayer extends Command<ICommandMoveLayerParams> {
    redo(): void {
        const {board, index: beforeIndex} = this.after!;
        const {index: afterIndex} = this.before!;
        [board.layers[beforeIndex], board.layers[afterIndex]] = [board.layers[afterIndex], board.layers[beforeIndex]];
    }

    undo(): void {
        const {board, index: beforeIndex} = this.after!;
        const {index: afterIndex} = this.before!;
        [board.layers[beforeIndex], board.layers[afterIndex]] = [board.layers[afterIndex], board.layers[beforeIndex]];
    }
}

export class CommandLayerVisible extends Command<ICommandLayerVisibleParams> {
    redo(): void {
        const {layer, invisible} = this.after!;
        layer.setInvisible(invisible);
    }

    undo(): void {
        const {layer, invisible} = this.before!;
        layer.setInvisible(invisible);
    }
}

export class CommandLayerLock extends Command<ICommandLayerLockParams> {
    redo(): void {
        const {layer, locked, board} = this.after!;
        layer.setLocked(locked);
        board.afterLayerLocked(layer);
    }

    undo(): void {
        const {layer, locked, board} = this.before!;
        layer.setLocked(locked);
        board.afterLayerLocked(layer);
    }
}

export class CommandPrimitiveVisible extends Command<ICommandPrimitiveVisibleParams> {
    redo(): void {
        const {primitive, invisible} = this.after!;
        primitive.setInvisible(invisible);
    }

    undo(): void {
        const {primitive, invisible} = this.before!;
        primitive.setInvisible(invisible);
    }
}

export class CommandPrimitiveLock extends Command<ICommandPrimitiveLockParams> {
    redo(): void {
        const {primitive, locked, board} = this.after!;
        primitive.setLocked(locked);
        board.afterPrimitiveLocked(primitive);
    }

    undo(): void {
        const {primitive, locked, board} = this.before!;
        primitive.setLocked(locked);
        board.afterPrimitiveLocked(primitive);
    }
}

export class CommandPrimitiveAttrs extends Command<ICommandPrimitiveAttrParams> {
    exec(primitives: PrimitiveInstance[], attrs) {
        primitives.forEach(p => {
            const {attributes, status} = attrs[p.id];
            if (attributes) {
                for (const key in attributes) {
                    p.setAttribute(key, attributes[key]);
                }
            }
            if (status) {
                for (const key in status) {
                    p.setStatus(key, status[key]);
                }
            }
        });
    }

    redo(): void {
        const {primitives, attrs} = this.after!;
        this.exec(primitives, attrs);
    }

    undo(): void {
        const {primitives, attrs} = this.before!;
        this.exec(primitives, attrs);
    }
}

export class CommandPrimitiveResize extends Command<ICommandPrimitiveResizeParams> {
    exec(primitive: PrimitiveInstance, attributes: IAttributes) {
        if (attributes) {
            for (const key in attributes) {
                primitive.setAttribute(key, attributes[key]);
            }
        }
    }

    redo(): void {
        const {primitive, attributes} = this.after!;
        this.exec(primitive, attributes);
    }

    undo(): void {
        const {primitive, attributes} = this.before!;
        this.exec(primitive, attributes);
    }
}

export class CommandPrimitiveRotate extends Command<ICommandPrimitiveRotateParams> {
    exec(primitive: PrimitiveInstance, attributes: IAttributes) {
        if (primitive.type === PrimitiveTypeAllEnum.LINE) {
            attributes = attributes as ILineAttr;
            primitive.setSize(attributes.x, attributes.y, attributes.posList);
        } else {
            primitive.setRotate(attributes.rotate!);
        }
    }

    redo(): void {
        const {primitive, attributes} = this.after!;
        this.exec(primitive, attributes);
    }

    undo(): void {
        const {primitive, attributes} = this.before!;
        this.exec(primitive, attributes);
    }
}

export class CommandPrimitiveZIndexChange extends Command<ICommandPrimitiveZIndexChangeParams> {
    redo(): void {
        const {primitive, index: afterIndex} = this.after!;
        const {index: beforeIndex} = this.before!;
        const layer = primitive.layer!;
        [layer.elements[beforeIndex], layer.elements[afterIndex]] = [
            layer.elements[afterIndex],
            layer.elements[beforeIndex],
        ];
    }

    undo(): void {
        const {primitive, index: afterIndex} = this.after!;
        const {index: beforeIndex} = this.before!;
        const layer = primitive.layer!;
        [layer.elements[beforeIndex], layer.elements[afterIndex]] = [
            layer.elements[afterIndex],
            layer.elements[beforeIndex],
        ];
    }
}
