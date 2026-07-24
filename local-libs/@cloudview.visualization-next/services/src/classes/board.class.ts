import type {
    IAttrDef,
    IBoard,
    IBoardAttr,
    ICommandCopyPrimitiveParams,
    ICommandPrimitiveAttrChangedParams,
    ICommandRemovePrimitivesParams,
    IEditConfig,
    ILayer,
    IMovingRectBox,
    IMovingStartPoint,
    ISelectRectBox,
    ISelectStartPoint,
} from '../types';
import {IdUtils} from '../tools';
import {Layer} from './layer.class';
import {Box, Matrix, type Svg, type ViewBoxLike} from '@svgdotjs/svg.js';
import type {Observer, PrimitiveInstance} from './index';
import {
    CommandCopyPrimitive,
    CommandPrimitiveAttrs,
    CommandPrimitiveZIndexChange,
    CommandRemovePrimitives,
    PrimitiveInstanceFactory,
    PrimitiveInstanceImage,
    PrimitiveInstanceSvg,
    PrimitiveInstanceSvgLine,
} from './index';
import {
    alignDirection,
    distributeType,
    moveDirection,
    MovingTypes,
    Topics,
    useGlobalConfig,
} from '@cloudview.visualization-next/services';
import type {Command} from './command.class';
import {computed, type ComputedRef, reactive, watch} from 'vue';
import {requestFrame} from '../functions';

const t = useGlobalConfig('t');

export class Board implements IBoard {
    attributes: IBoardAttr;
    boardId: string;
    boardName: string;
    editConfig: IEditConfig;
    layers: Layer[];
    parameters: Record<string, IAttrDef>;

    private selectStartPoint?: ISelectStartPoint | null;
    private observer?: Observer;
    isSpaceDown = false;
    private options?: {[key: string]: any};
    private zoomRatio = 0.1;

    svgInstance?: Svg;
    selectRectBox: ISelectRectBox = {x: 0, y: 0, width: 0, height: 0};
    selectedPrimitives: PrimitiveInstance[] = reactive([]);
    selectedLayer: Layer | null = null;

    movingRect?: IMovingRectBox = {x: 0, y: 0, width: 0, height: 0, visible: false, rotate: 0, transform: ''};
    movingStartPoint?: IMovingStartPoint | null;
    movingType: symbol = MovingTypes.NONE;

    panLast?: {x: number; y: number};
    wheelZoomDeltaModeLinePixels = 17;
    wheelZoomDeltaModeScreenPixels = 53;

    elementNamesDict: Record<string, number> = {};

    directionKeyDownSet = new Set<symbol>();

    undoCommands: Command<any>[] = reactive([]);
    redoCommands: Command<any>[] = reactive([]);

    private maxUndoLength = 100;

    selectedPrimitivesAttrs: ComputedRef<Record<string, ICommandPrimitiveAttrChangedParams>>;
    primitiveAttrChangeWatch?: () => void;
    zoom = 1;

    constructor(board?: IBoard | null) {
        this.attributes = board?.attributes ?? Board.initAttr();
        this.boardId = board?.boardId ?? IdUtils.genBoardId();
        this.boardName = board?.boardName ?? this.getDefaultName();
        this.editConfig = board?.editConfig ?? {invisibleIds: {}, lockedIds: {}};
        this.layers = (board?.layers ?? [null]).map((layer: ILayer | null) => new Layer(layer));
        this.parameters = board?.parameters ?? {};
        this.selectedLayer = this.layers[0] ?? null;
        this.selectedLayer?.setSelected(true);

        this.layers.forEach(layer => {
            layer.elements.forEach(element => {
                if (!this.elementNamesDict[element.baseId]) {
                    this.elementNamesDict[element.baseId] = 1;
                }
                const name = element.name;
                const nameArr = name.split('-');
                const index = Number(nameArr[nameArr.length - 1]);
                if (!isNaN(index)) {
                    this.elementNamesDict[element.baseId] = Math.max(this.elementNamesDict[element.baseId], index + 1);
                }
            });
        });

        this.selectedPrimitivesAttrs = computed(() => {
            const res = {};
            this.selectedPrimitives.forEach(p => {
                res[p.id] = {
                    attributes: {...p.attributes},
                    id: p.id,
                    status: p instanceof PrimitiveInstanceSvg ? {...p.status} : null,
                };
            });
            return res;
        });
        this.createPrimitiveAttrsChangeWatch();
    }

    createPrimitiveAttrsChangeWatch = () => {
        this.primitiveAttrChangeWatch = watch(
            this.selectedPrimitivesAttrs,
            (newAttrs, oldAttrs) => {
                if (Object.keys(newAttrs).length === Object.keys(oldAttrs).length) {
                    const beforeDict: Record<string, ICommandPrimitiveAttrChangedParams> = {};
                    const afterDict: Record<string, ICommandPrimitiveAttrChangedParams> = {};
                    const changedList: PrimitiveInstance[] = [];
                    this.selectedPrimitives.forEach(p => {
                        if (p.id in newAttrs && p.id in oldAttrs) {
                            if (JSON.stringify(newAttrs[p.id]) !== JSON.stringify(oldAttrs[p.id])) {
                                beforeDict[p.id] = oldAttrs[p.id];
                                afterDict[p.id] = newAttrs[p.id];
                                changedList.push(p);
                            }
                        }
                    });
                    if (changedList.length > 0) {
                        const command = new CommandPrimitiveAttrs(
                            {
                                primitives: changedList,
                                attrs: beforeDict,
                            },
                            {
                                primitives: changedList,
                                attrs: afterDict,
                            }
                        );
                        this.addCommand(command);
                    }
                }
            },
            {deep: true}
        );
    };

    cancelPrimitiveAttrsChangeWatch() {
        this.primitiveAttrChangeWatch?.();
    }

    private getDefaultName(): string {
        return t.value!('vis.configuration.defaultBoard');
    }

    private static initAttr(): IBoardAttr {
        return {
            'background-color': null,
            viewBox: {
                x: 0,
                y: 0,
                width: -1,
                height: -1,
            },
            panDisable: false,
            zoomDisable: false,
        };
    }

    setSvgInstance(svgInstance: Svg) {
        this.svgInstance = svgInstance;
    }

    setObserver(observer: Observer) {
        this.observer = observer;
    }

    setOptions(options: {[key: string]: any}) {
        this.options = options;
    }

    computeBoundary(): ViewBoxLike | null {
        let boundary = {top: Infinity, right: -Infinity, left: Infinity, bottom: -Infinity};
        this.layers.forEach(layer => {
            layer.elements.forEach(primitive => {
                const position = primitive.getPosition();
                const boundRect = primitive.getBoundRect();
                if (boundary === null) {
                    boundary = {
                        left: position.x,
                        right: position.x + boundRect.width,
                        top: position.y,
                        bottom: position.y + boundRect.height,
                    };
                } else {
                    boundary.left = Math.min(boundary.left, position.x);
                    boundary.right = Math.max(boundary.right, position.x + boundRect.width);
                    boundary.top = Math.min(boundary.top, position.y);
                    boundary.bottom = Math.max(boundary.bottom, position.y + boundRect.height);
                }
            });
        });
        if (boundary.top === Infinity) {
            return null;
        } else {
            return {
                x: boundary.left,
                y: boundary.top,
                width: boundary.right - boundary.left,
                height: boundary.bottom - boundary.top,
            };
        }
    }

    /*
     *  快捷键
     * */

    // 空格键按下，开启panZoom
    spaceDown(e: KeyboardEvent) {
        if (this.movingType === MovingTypes.NONE) {
            this.options!.beforePanZoom = true;
            this.isSpaceDown = true;
        }
    }

    fitToScreen() {
        const boundary = this.computeBoundary();
        if (boundary != null) {
            this.svgInstance?.viewbox(boundary);
        }
    }

    beforePan(e) {
        if (this.movingType !== MovingTypes.NONE) {
            return;
        }
        this.movingType = MovingTypes.PAN;
        this.options!.panZooming = true;
        this.panLast = {
            x: e.clientX,
            y: e.clientY,
        };
    }

    panning(e) {
        if (!this.isSpaceDown || !this.panLast || this.movingType !== MovingTypes.PAN) {
            return;
        }
        const currentP = this.svgInstance!.point(e.clientX, e.clientY);
        const lastP = this.svgInstance!.point(this.panLast.x, this.panLast.y);
        const deltaP = [lastP!.x - currentP.x, lastP!.y - currentP.y];

        if (!deltaP[0] && !deltaP[1]) {
            return;
        }

        const box = new Box(this.svgInstance!.viewbox()).transform(new Matrix().translate(deltaP[0], deltaP[1]));
        this.panLast!.x = e.clientX;
        this.panLast!.y = e.clientY;

        this.svgInstance!.viewbox(box);
    }

    panEnd(e) {
        this.movingType = MovingTypes.NONE;
        this.panLast = undefined;
        this.options!.panZooming = false;
        this.observer?.dispatch(Topics.VIEWBOX_CHANGED, this.svgInstance?.viewbox());
    }

    // 空格键抬起，关闭panZoom
    spaceUp(e?: KeyboardEvent) {
        if (this.isSpaceDown) {
            this.isSpaceDown = false;
            this.movingType = MovingTypes.NONE;
            this.panLast = undefined;
            this.options!.panZooming = false;
            this.options!.beforePanZoom = false;
        }
    }

    zooming(e) {
        if (this.isSpaceDown) {
            e.preventDefault();
            let deltaY;
            switch (e.deltaMode) {
                case 1:
                    deltaY = e.deltaY * this.wheelZoomDeltaModeLinePixels;
                    break;
                case 2:
                    deltaY = e.deltaY * this.wheelZoomDeltaModeScreenPixels;
                    break;
                default:
                    deltaY = e.deltaY;
            }
            const lvl = Math.pow(1 + this.zoomRatio, deltaY / 100) * this.svgInstance!.zoom();
            const p = this.svgInstance!.point(e.clientX, e.clientY);
            this.svgInstance!.zoom(Math.max(Math.min(lvl, 20), 0.05), p);
            this.zoom = this.svgInstance!.zoom();
            this.observer?.dispatch(Topics.VIEWBOX_CHANGED, this.svgInstance?.viewbox());
        }
    }

    // 鼠标按下
    mousedown(e: MouseEvent) {
        if (this.isSpaceDown) {
            this.beforePan(e);
            return;
        }
        this.movingType = MovingTypes.MULTI_SELECT;
        const point = this.svgInstance!.point(e.clientX, e.clientY);
        this.selectStartPoint = {
            x: point.x,
            y: point.y,
        };
        this.selectRectBox = {
            x: point.x,
            y: point.y,
            width: 0,
            height: 0,
        };
    }

    multiSelect(e: MouseEvent) {
        if (!this.selectStartPoint || !this.selectRectBox) return;
        const point = this.svgInstance!.point(e.clientX, e.clientY);
        this.selectRectBox.width = Math.abs(point.x - this.selectStartPoint?.x);
        this.selectRectBox.height = Math.abs(point.y - this.selectStartPoint?.y);
        this.selectRectBox.x = Math.min(this.selectStartPoint?.x, point.x);
        this.selectRectBox.y = Math.min(this.selectStartPoint?.y, point.y);
    }

    multiMove(e: MouseEvent) {
        if (!this.movingStartPoint || !this.movingRect) return;
        const point = this.svgInstance!.point(e.clientX, e.clientY);
        const distanceX = point.x - this.movingStartPoint.x;
        const distanceY = point.y - this.movingStartPoint.y;
        this.movingStartPoint.distanceX += distanceX;
        this.movingStartPoint.distanceY += distanceY;
        this.movingStartPoint.x = point.x;
        this.movingStartPoint.y = point.y;
        this.movingRect.x = this.movingRect.x + distanceX;
        this.movingRect.y = this.movingRect.y + distanceY;
        this.movingRect.visible = true;
        const centerX = this.movingRect.x + this.movingRect.width / 2;
        const centerY = this.movingRect.y + this.movingRect.height / 2;
        this.movingRect.transform = `rotate(${this.movingRect.rotate} ${centerX} ${centerY})`;
    }

    // 鼠标移动
    mousemove(e: MouseEvent) {
        if (this.movingType !== MovingTypes.NONE) {
            requestFrame.next(() => {
                switch (this.movingType) {
                    case MovingTypes.MULTI_SELECT:
                        this.multiSelect(e);
                        break;
                    case MovingTypes.MOVE:
                        this.multiMove(e);
                        break;
                    case MovingTypes.PAN:
                        this.panning(e);
                        break;
                }
            });
        }
    }

    multiSelectEnd(e: MouseEvent) {
        if (!this.selectStartPoint || !this.selectRectBox) return;
        this.selectRectBox = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        const point = this.svgInstance!.point(e.clientX, e.clientY);
        const x1 = Math.min(this.selectStartPoint?.x, point.x);
        const y1 = Math.min(this.selectStartPoint?.y, point.y);
        const x2 = Math.max(this.selectStartPoint?.x, point.x);
        const y2 = Math.max(this.selectStartPoint?.y, point.y);

        this.clearSelected();
        const layersBuckets = new Array(this.layers.length).fill(0);
        this.layers?.forEach((layer, index) => {
            if (!layer.locked) {
                layer.elements.forEach(element => {
                    if (!element.locked && element.in(x1, y1, x2, y2)) {
                        element.setSelected(true);
                        this.selectedPrimitives.push(element);
                        layersBuckets[index]++;
                    }
                });
            }
        });
        const max = Math.max(...layersBuckets);
        if (this.selectedPrimitives.length !== 0 && max === this.selectedPrimitives.length) {
            const index = layersBuckets.indexOf(max);
            this.selectedLayer?.setSelected(false);
            this.selectedLayer = this.layers[index];
            this.selectedLayer?.setSelected(true);
        }

        this.selectStartPoint = null;
    }

    multiMoveEnd(e: MouseEvent) {
        if (!this.movingStartPoint || !this.movingRect) return;
        this.movingRect.visible = false;
        if (!e.shiftKey) {
            this.selectedPrimitives.forEach(primitive => {
                const {x, y} = primitive.getPosition();
                primitive.setPosition(x + this.movingStartPoint!.distanceX!, y + this.movingStartPoint!.distanceY!);
            });
        } else {
            const copyPrimitives: PrimitiveInstance[] = [];
            const after: ICommandCopyPrimitiveParams = {board: this, primitives: []};
            this.selectedPrimitives.forEach(primitive => {
                const {x, y} = primitive.getPosition();
                const config = JSON.parse(JSON.stringify(primitive.getConfig()));
                const nameSplitIndex = primitive.name.lastIndexOf('-');
                let basename = primitive.name;
                if (nameSplitIndex > 0) {
                    basename = primitive.name.substring(0, nameSplitIndex);
                }
                config.name = this.getNewPrimitiveName(config.baseId, basename);
                config.id = IdUtils.genPrimitiveId();
                config.layerId = this.selectedLayer!.id;
                config.layer = this.selectedLayer;
                const copyPrimitive = reactive(PrimitiveInstanceFactory.getInstance(config)) as PrimitiveInstance;
                copyPrimitive.setSelected(true);
                copyPrimitive.setPosition(x + this.movingStartPoint!.distanceX!, y + this.movingStartPoint!.distanceY!);
                if (primitive instanceof PrimitiveInstanceSvg || primitive instanceof PrimitiveInstanceImage) {
                    (copyPrimitive as PrimitiveInstanceSvg).setModel(primitive.model!);
                }
                copyPrimitives.push(copyPrimitive);
                this.selectedLayer!.elements.push(copyPrimitive);
                primitive.setSelected(false);
                after.primitives.push(copyPrimitive);
            });
            this.selectedPrimitives.length = 0;
            this.selectedPrimitives.push(...copyPrimitives);
            const command = new CommandCopyPrimitive(undefined, after);
            this.addCommand(command);
        }
    }

    // 鼠标抬起
    mouseup(e: MouseEvent) {
        requestAnimationFrame(() => {
            if (this.movingType !== MovingTypes.NONE) {
                switch (this.movingType) {
                    case MovingTypes.MULTI_SELECT:
                        this.multiSelectEnd(e);
                        break;
                    case MovingTypes.MOVE:
                        this.multiMoveEnd(e);
                        break;
                    case MovingTypes.PAN:
                        this.panEnd(e);
                        break;
                }
                this.movingType = MovingTypes.NONE;
            }
        });
    }

    clearSelected(newSelected?: PrimitiveInstance) {
        while (this.selectedPrimitives.length > 0) {
            const primitive = this.selectedPrimitives.pop();
            if (primitive !== newSelected) {
                primitive?.setSelected(false);
            }
        }
    }

    setMovingStartPoint(x, y) {
        const point = this.svgInstance!.point(x, y);
        this.movingStartPoint = {x: point.x, y: point.y, distanceX: 0, distanceY: 0};
    }

    initMovingRect() {
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        let transform = '';
        let rotate = 0;

        if (this.selectedPrimitives.length > 1) {
            this.selectedPrimitives.forEach(primitive => {
                const primitiveMinMax = primitive.getMinMax();
                minX = Math.min(minX, primitiveMinMax.minX);
                minY = Math.min(minY, primitiveMinMax.minY);
                maxX = Math.max(maxX, primitiveMinMax.maxX);
                maxY = Math.max(maxY, primitiveMinMax.maxY);
            });
        } else if (this.selectedPrimitives.length === 1) {
            minX = this.selectedPrimitives[0].getMinX();
            minY = this.selectedPrimitives[0].getMinY();
            maxX = this.selectedPrimitives[0].getMaxX();
            maxY = this.selectedPrimitives[0].getMaxY();
        }

        if (this.selectedPrimitives.length === 1) {
            rotate = this.selectedPrimitives[0].attributes.rotate!;
            if (!(this.selectedPrimitives[0] instanceof PrimitiveInstanceSvgLine)) {
                const center = this.selectedPrimitives[0].getCenter();
                transform = `rotate(${rotate}, ${center.centerX},${center.centerY})`;
            } else {
                transform = `rotate(${rotate})`;
            }
        }
        this.movingRect = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            visible: false,
            transform,
            rotate,
        };
    }

    private getNewPosition(position, direction: symbol, timesTen = false) {
        const step = timesTen ? 10 : 1;
        switch (direction) {
            case moveDirection.ArrowUp:
                position.y -= step;
                position.distanceY -= step;
                break;
            case moveDirection.ArrowDown:
                position.y += step;
                position.distanceY += step;
                break;
            case moveDirection.ArrowLeft:
                position.x -= step;
                position.distanceX -= step;
                break;
            case moveDirection.ArrowRight:
                position.x += step;
                position.distanceX += step;
                break;
        }
        return position;
    }

    microMove(direction: symbol, timesTen?: boolean) {
        this.directionKeyDownSet.add(direction);
        if (!this.movingRect!.visible) {
            this.initMovingRect();
            this.movingStartPoint = {
                x: this.movingRect!.x,
                y: this.movingRect!.y,
                distanceX: 0,
                distanceY: 0,
            };
        }
        if (!this.movingStartPoint || !this.movingRect) return;
        this.getNewPosition(this.movingStartPoint, direction, timesTen);
        this.movingRect.x = this.movingStartPoint.x;
        this.movingRect.y = this.movingStartPoint.y;
        this.movingRect.visible = true;
        const centerX = this.movingRect.x + this.movingRect.width / 2;
        const centerY = this.movingRect.y + this.movingRect.height / 2;
        this.movingRect.transform = `rotate(${this.movingRect.rotate} ${centerX} ${centerY})`;
    }

    microMoveEnd(direction: symbol) {
        this.directionKeyDownSet.delete(direction);
        if (this.directionKeyDownSet.size === 0) {
            this.selectedPrimitives.forEach(primitive => {
                const position = primitive.getPosition();
                primitive.setPosition(
                    position.x + this.movingStartPoint!.distanceX!,
                    position.y + this.movingStartPoint!.distanceY!
                );
            });
            this.movingRect!.visible = false;
        }
    }

    getConfig(): IBoard {
        return {
            attributes: this.attributes,
            boardId: this.boardId,
            boardName: this.boardName,
            editConfig: this.editConfig,
            layers: this.layers.map(layer => layer.getConfig()),
            parameters: this.parameters,
        };
    }

    getNewPrimitiveName(baseId: string, baseName: string): string {
        const index = this.elementNamesDict[baseId] || 1;
        this.elementNamesDict[baseId] = index + 1;
        return `${baseName}-${index}`;
    }

    zIndexChangeCommand(primitive, beforeIndex, afterIndex) {
        const before = {primitive, index: beforeIndex};
        const command = new CommandPrimitiveZIndexChange(before, {primitive, index: afterIndex});
        this.addCommand(command);
    }

    layerUp() {
        const selected = this.selectedPrimitives[0];
        if (selected) {
            const index = this.selectedLayer!.elements.indexOf(selected);
            if (index < this.selectedLayer!.elements.length - 1) {
                this.selectedLayer!.elements.splice(index, 1);
                this.selectedLayer!.elements.splice(index + 1, 0, selected);
                this.zIndexChangeCommand(selected, index, index + 1);
            }
        }
    }

    layerDown() {
        const selected = this.selectedPrimitives[0];
        if (selected) {
            const index = this.selectedLayer!.elements.indexOf(selected);
            if (index > 0) {
                this.selectedLayer!.elements.splice(index, 1);
                this.selectedLayer!.elements.splice(index - 1, 0, selected);
                this.zIndexChangeCommand(selected, index, index - 1);
            }
        }
    }

    topLayer() {
        const selected = this.selectedPrimitives[0];
        if (selected) {
            const index = this.selectedLayer!.elements.indexOf(selected);
            if (index < this.selectedLayer!.elements.length - 1) {
                this.selectedLayer!.elements.splice(index, 1);
                this.selectedLayer!.elements.splice(this.selectedLayer!.elements.length, 0, selected);
                this.zIndexChangeCommand(selected, index, this.selectedLayer!.elements.length - 1);
            }
        }
    }

    bottomLayer() {
        const selected = this.selectedPrimitives[0];
        if (selected) {
            const index = this.selectedLayer!.elements.indexOf(selected);
            if (index > 0) {
                this.selectedLayer!.elements.splice(index, 1);
                this.selectedLayer!.elements.splice(0, 0, selected);
                this.zIndexChangeCommand(selected, index, 0);
            }
        }
    }

    enlarge() {
        let zoom = this.svgInstance!.zoom();
        zoom += zoom * this.zoomRatio;
        this.svgInstance!.zoom(zoom);
        this.zoom = this.svgInstance!.zoom();
        this.observer?.dispatch(Topics.VIEWBOX_CHANGED, this.svgInstance!.viewbox());
    }

    narrow() {
        let zoom = this.svgInstance!.zoom();
        zoom -= zoom * this.zoomRatio;
        this.svgInstance!.zoom(zoom);
        this.zoom = this.svgInstance!.zoom();
        this.observer?.dispatch(Topics.VIEWBOX_CHANGED, this.svgInstance!.viewbox());
    }

    align(direction) {
        let base,
            compare,
            attribute = 'x',
            offset = '',
            offsetAttribute;
        switch (direction) {
            case alignDirection.TOP:
                attribute = 'y';
                base = Infinity;
                compare = Math.min.bind(Math);
                break;
            case alignDirection.LEFT:
                attribute = 'x';
                base = Infinity;
                compare = Math.min.bind(Math);
                break;
            case alignDirection.RIGHT:
                base = -Infinity;
                compare = Math.max.bind(Math);
                offset = 'side';
                offsetAttribute = 'width';
                break;
            case alignDirection.BOTTOM:
                base = -Infinity;
                compare = Math.max.bind(Math);
                attribute = 'y';
                offsetAttribute = 'height';
                offset = 'side';
                break;
            case alignDirection.MIDDLE:
                offset = 'middle';
                attribute = 'y';
                offsetAttribute = 'height';
                break;
            case alignDirection.CENTER:
                offset = 'center';
                attribute = 'x';
                offsetAttribute = 'width';
                break;
            default:
                return;
        }

        this.selectedPrimitives.forEach(primitive => {
            const box = {...primitive.getPosition(), ...primitive.getBoundRect()};
            if (!offset) {
                base = compare(base, box[attribute]);
            } else if (offset === 'side') {
                base = compare(base, box[attribute] + box[offsetAttribute]);
            } else {
                base = box[attribute] + box[offsetAttribute] / 2;
            }
        });

        this.selectedPrimitives.forEach(primitive => {
            const box = {...primitive.getPosition(), ...primitive.getBoundRect()};
            if (!offset) {
                box[attribute] = base;
            } else if (offset === 'side') {
                box[attribute] = base - box[offsetAttribute];
            } else {
                box[attribute] = base - box[offsetAttribute] / 2;
            }
            primitive.setPosition(box.x, box.y);
        });
    }

    distribute(direction) {
        if (this.selectedPrimitives.length < 3) {
            return;
        }
        const dimension = direction === distributeType.HORIZONTAL ? 'x' : 'y';
        const otherDimension = dimension === 'x' ? 'y' : 'x';

        let min = Infinity,
            max = -Infinity,
            d = 0;

        this.selectedPrimitives.sort((a, b) => a.getPosition()[dimension] - b.getPosition()[dimension]);

        this.selectedPrimitives.forEach(primitive => {
            const box = primitive.getPosition();
            min = Math.min(min, box[dimension]);
            max = Math.max(max, box[dimension]);
        });
        d = (max - min) / (this.selectedPrimitives.length - 1);
        this.selectedPrimitives.forEach((primitive, index) => {
            if (index === 0 || index === this.selectedPrimitives.length - 1) {
                return;
            }
            const model = {
                [dimension]: parseInt((min + d * index).toFixed(0), 10),
                [otherDimension]: primitive.getPosition()[otherDimension],
            };
            primitive.setPosition(model.x, model.y);
        });
    }

    delete() {
        const before: ICommandRemovePrimitivesParams = {board: this, primitives: []};
        const primitiveSet = new Set(this.selectedPrimitives);
        const layersSet = new Set(this.selectedPrimitives.map(primitive => primitive.layerId));
        this.layers.forEach(layer => {
            if (layersSet.has(layer.id)) {
                for (let i = layer.elements.length - 1; i >= 0; i--) {
                    if (primitiveSet.has(layer.elements[i])) {
                        // 获取被删除之前的相关信息
                        before.primitives.unshift({
                            primitive: layer.elements[i],
                            index: i,
                        });

                        primitiveSet.delete(layer.elements[i]);
                        layer.elements.splice(i, 1);
                    }
                }
            }
        });
        this.selectedPrimitives.length = 0;
        const command = new CommandRemovePrimitives(before);
        this.addCommand(command);
    }

    clickSelect(primitive, layer) {
        const selected = primitive.selected;
        primitive.setSelected(!selected);
        if (!selected) {
            if (this.selectedPrimitives.length === 0) {
                this.selectedLayer = layer;
                layer.setSelected(true);
            }
            this.selectedPrimitives.push(primitive);
        } else {
            const index = this.selectedPrimitives.indexOf(primitive);
            if (index > -1) {
                this.selectedPrimitives.splice(index, 1);
            }
        }
    }

    undo() {
        if (this.undoCommands.length > 0) {
            this.cancelPrimitiveAttrsChangeWatch();
            const command = this.undoCommands.pop();
            command!.undo();
            this.redoCommands.push(command!);
            this.createPrimitiveAttrsChangeWatch();
        }
    }

    redo() {
        if (this.redoCommands.length > 0) {
            this.cancelPrimitiveAttrsChangeWatch();
            const command = this.redoCommands.pop();
            command!.redo();
            this.undoCommands.push(command!);
            this.createPrimitiveAttrsChangeWatch();
        }
    }

    addCommand(command) {
        this.undoCommands.push(command);
        if (this.undoCommands.length > this.maxUndoLength) {
            this.undoCommands.shift();
        }
        this.redoCommands.length = 0;
    }

    afterLayerLocked(layer: Layer) {
        if (layer.locked) {
            const selectedPrimitives = this.selectedPrimitives.filter(item => {
                if (item.layer === layer) {
                    item.setSelected(false);
                }
                return item.layer !== layer;
            });
            this.selectedPrimitives.length = 0;
            this.selectedPrimitives.push(...selectedPrimitives);
        }
    }

    afterPrimitiveLocked(primitive: PrimitiveInstance) {
        if (primitive.selected) {
            const index = this.selectedPrimitives.indexOf(primitive);
            if (index !== -1) {
                this.selectedPrimitives.splice(index, 1);
                primitive.setSelected(false);
            }
        }
    }

    resetZoom() {
        this.zoom = this.svgInstance?.zoom() ?? this.zoom;
    }
}
