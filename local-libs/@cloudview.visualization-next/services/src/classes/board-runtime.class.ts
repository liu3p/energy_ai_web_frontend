import {Observer} from './observer.class';
import type {IBoard, IBoardAttr} from '../types';
import {PlayerError} from './player-error.class';
import type {PrimitiveInstance} from './instance-primitive.class';
import {PrimitiveInstanceFactory} from './instance-primitive-factory.class';

export class BoardRuntime extends Observer {
    id: string;
    name: string;
    config: IBoard;
    primitives: PrimitiveInstance[] = [];
    parameters: IBoard['parameters'];
    attributes: IBoardAttr;
    isParsed = false;

    constructor(config: IBoard) {
        super();
        this.id = config.boardId;
        this.name = config.boardName;
        this.config = config;
        this.parameters = config.parameters;
        this.attributes = config.attributes!;
    }

    parse(): void {
        if (this.isParsed) return;

        this.config.layers?.forEach(layer => {
            layer.elements.forEach(primitiveConfig => {
                const primitive = PrimitiveInstanceFactory.getInstance(primitiveConfig);
                primitive.flatAttrsAndBindingsForPlayer();
                this.primitives.push(primitive);
            });
        });

        this.isParsed = true;
    }

    getPrimitiveById(id: string): PrimitiveInstance | null {
        let primitive: PrimitiveInstance | null = null;
        this.primitives.some(item => {
            if (item.id === id) {
                primitive = item;
                return true;
            }
            return false;
        });
        return primitive;
    }

    getBoardArg(key) {
        const boardArgs = this.parameters;
        if (!Reflect.has(boardArgs!, key)) {
            throw new PlayerError(`画板参数"${key}"不存在`, 'vis.player.unFoundBoardArg', {key: key});
        }
        return boardArgs?.[key].value;
    }

    setBoardArg(key, value) {
        const boardArgs = this.parameters;
        if (boardArgs?.[key].value !== value) {
            boardArgs![key].value = value;
            this.dispatch(key, value);
        }
    }
}
