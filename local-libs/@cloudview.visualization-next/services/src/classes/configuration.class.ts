import type {IBoard, ICommandCopyPrimitiveParams, IConfiguration} from '../types';
import {EngineTypeEnum} from '../types';
import {Board} from './board.class';
import {throwError, useGlobalConfig} from '../functions';
import {IdUtils} from '../tools';
import {PrimitiveInstanceFactory} from './instance-primitive-factory.class';
import {CommandCopyPrimitive, PrimitiveInstance, PrimitiveInstanceSvg} from '@cloudview.visualization-next/services';
import {reactive} from 'vue';

const t = useGlobalConfig('t');

export class Configuration implements IConfiguration {
    content: Board[] = [new Board()];
    description = '';
    enabled = true;
    engine_type: EngineTypeEnum = EngineTypeEnum['2D'];
    id = '';
    name = '';
    vnb_id = '';
    public = true;
    tag = '';
    thumb_id = '';
    isFullscreen = false;
    el?: HTMLElement;
    supportFullscreen = false;
    fullscreenPrefix = '';
    activatedBoard?: Board;

    copyInfo: {
        sourceBoard?: Board;
        content: string;
        distanceMap?: Record<string, {dx: number; dy: number}>;
    } = {
        content: '',
    };

    constructor(config?: IConfiguration | null) {
        this.setConfig(config!);
    }

    setConfig(config: IConfiguration | null): void {
        this.id = config?.id ?? this.id;
        this.name = config?.name.trim() ?? this.name;
        this.public = config?.public ?? this.public;
        this.tag = config?.tag?.trim() ?? this.tag;
        this.vnb_id = config?.vnb_id ?? this.vnb_id;
        this.thumb_id = config?.thumb_id ?? this.thumb_id;
        this.engine_type = config?.engine_type ?? this.engine_type;
        this.enabled = config?.enabled ?? this.enabled;
        this.description = config?.description.trim() ?? this.description;
        this.content = config?.content?.map((board: IBoard | null) => new Board(board)) ?? this.content;
    }

    getConfig(): IConfiguration {
        return {
            content: this.content.map(board => board.getConfig()),
            description: this.description,
            enabled: this.enabled,
            engine_type: this.engine_type,
            id: this.id,
            name: this.name,
            vnb_id: this.vnb_id,
            public: this.public,
            tag: this.tag,
            thumb_id: this.thumb_id,
        };
    }

    getDefinitionConfig() {
        return {
            description: this.description,
            enabled: this.enabled,
            engine_type: this.engine_type,
            id: this.id,
            name: this.name,
            vnb_id: this.vnb_id,
            public: this.public,
            tag: this.tag,
            thumb_id: this.thumb_id,
        };
    }

    setEl(el: HTMLElement) {
        this.el = el;
    }

    setFullscreenInfo(isSupport, prefix) {
        this.supportFullscreen = isSupport;
        this.fullscreenPrefix = prefix;
    }

    setActivatedBoard(board) {
        this.activatedBoard = board;
    }

    toggleFullscreen() {
        if (!this.supportFullscreen) {
            throwError('ConfigurationEditor', t.value('vis.common.fullScreenMassage'));
            return;
        }
        let methodName;
        if (this.isFullscreen) {
            methodName = this.fullscreenPrefix === '' ? 'exitFullscreen' : `${this.fullscreenPrefix}ExitFullscreen`;
            document[methodName]();
        } else {
            methodName =
                this.fullscreenPrefix === '' ? 'requestFullscreen' : `${this.fullscreenPrefix}RequestFullscreen`;
            this.el!.style.position = 'fixed';
            this.el!.style.top = '0';
            this.el!.style.left = '0';
            this.el!.style.zIndex = '100';
            document.body[methodName]();
        }
    }

    copy() {
        if (this.activatedBoard!.selectedPrimitives.length === 0) {
            return;
        }
        this.copyInfo.sourceBoard = this.activatedBoard;
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        this.activatedBoard!.selectedPrimitives.forEach(primitive => {
            const primitiveMinMax = primitive.getMinMax();
            minX = Math.min(minX, primitiveMinMax.minX);
            minY = Math.min(minY, primitiveMinMax.minY);
            maxX = Math.max(maxX, primitiveMinMax.maxX);
            maxY = Math.max(maxY, primitiveMinMax.maxY);
        });
        const selectRectCenterX = (minX + maxX) / 2;
        const selectRectCenterY = (minY + maxY) / 2;
        this.copyInfo.distanceMap = {};

        this.copyInfo.content = JSON.stringify(
            this.activatedBoard?.selectedPrimitives.map(primitive => {
                const position = primitive.getPosition();
                this.copyInfo.distanceMap![primitive.id] = {
                    dx: position.x - selectRectCenterX,
                    dy: position.y - selectRectCenterY,
                };
                return {...primitive.getConfig(), model: (primitive as PrimitiveInstanceSvg).model};
            })
        );
    }

    paste() {
        if (this.copyInfo.sourceBoard) {
            const selectedPrimitives = JSON.parse(this.copyInfo.content);
            this.activatedBoard!.selectedPrimitives.forEach(primitive => primitive.setSelected(false));
            this.activatedBoard!.selectedPrimitives.length = 0;

            const after: ICommandCopyPrimitiveParams = {board: this.activatedBoard!, primitives: []};
            const {cx, cy} = this.activatedBoard!.svgInstance!.viewbox()!;
            selectedPrimitives.forEach(primitive => {
                const nameSplitIndex = primitive.name.lastIndexOf('-');
                let basename = primitive.name;
                if (nameSplitIndex > 0) {
                    basename = primitive.name.substring(0, nameSplitIndex);
                }
                primitive.name = this.activatedBoard?.getNewPrimitiveName(primitive.baseId, basename);
                const copiedPrimitiveId = primitive.id;
                primitive.id = IdUtils.genPrimitiveId();
                primitive.layerId = this.activatedBoard?.selectedLayer?.id;

                if (this.activatedBoard !== this.copyInfo.sourceBoard) {
                    primitive.bindings = {};
                    primitive.devices = [];
                }
                const newPrimitive = reactive(
                    PrimitiveInstanceFactory.getInstance(primitive, this.activatedBoard!.selectedLayer!)
                ) as PrimitiveInstance;
                newPrimitive.setSelected(true);
                const position = newPrimitive.getPosition();
                position.x = cx + this.copyInfo.distanceMap![copiedPrimitiveId].dx;
                position.y = cy + this.copyInfo.distanceMap![copiedPrimitiveId].dy;
                newPrimitive.setPosition(position.x, position.y);
                newPrimitive.setModel?.(primitive.model);
                this.activatedBoard?.selectedLayer?.elements.push(newPrimitive);
                this.activatedBoard?.selectedPrimitives.push(newPrimitive);
                after.primitives.push(newPrimitive);
            });
            const command = new CommandCopyPrimitive(undefined, after);
            this.activatedBoard!.addCommand(command);
        }
    }
}
