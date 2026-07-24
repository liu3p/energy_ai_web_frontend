import type {
    IBeforeResizeModelStatus,
    ILineBox,
    IRectBox,
    IResizePoint,
    IResizeStartPoint,
    IRotateInfo,
    IRotatePoint,
    ISvgAttr,
} from '../types';
import {PrimitiveTypeAllEnum} from '../types';
import {debugWarn, requestFrame} from '../functions';
import type {PrimitiveInstance} from './instance-primitive.class';
import {Utils} from '../tools';
import type {ComputedRef, Ref} from 'vue';
import {computed, reactive, ref} from 'vue';
import type {Svg} from '@svgdotjs/svg.js';
import {Board, LinePathType, PrimitiveInstanceSvgLine, RotatingStatus} from '@cloudview.visualization-next/services';

export class ResizePoints {
    svgInstance: Ref<Svg | null> = ref(null);
    model: Ref<PrimitiveInstance | null> = ref(null);
    board: Board;
    cursors = [
        [
            'ns-resize',
            'ew-resize',
            'ns-resize',
            'ew-resize',
            'nwse-resize',
            'nesw-resize',
            'nwse-resize',
            'nesw-resize',
        ],
        [
            'nesw-resize',
            'nwse-resize',
            'nesw-resize',
            'nwse-resize',
            'ns-resize',
            'ew-resize',
            'ns-resize',
            'ew-resize',
        ],
        [
            'ew-resize',
            'ns-resize',
            'ew-resize',
            'ns-resize',
            'nesw-resize',
            'nwse-resize',
            'nesw-resize',
            'nwse-resize',
        ],
        [
            'nwse-resize',
            'nesw-resize',
            'nwse-resize',
            'nesw-resize',
            'ew-resize',
            'ns-resize',
            'ew-resize',
            'ns-resize',
        ],
    ];

    resizeStartPoint: IResizeStartPoint = reactive({
        index: -1,
        point: {
            cx: 0,
            cy: 0,
            cursor: '',
            size: 5,
        },
        distanceX: 0,
        distanceY: 0,
        x: 0,
        y: 0,
    });

    beforeResizeModelStatus: IBeforeResizeModelStatus = {height: 0, width: 0, x: 0, y: 0};

    rotateInfo: IRotateInfo = {startX: 0, startY: 0, rotate: 0};
    rotateStatus: Ref<symbol> = ref(RotatingStatus.NONE);

    alignDistance = 10;

    public points: ComputedRef<IResizePoint[]> = computed(() => {
        if (this.model.value) {
            const res =
                this.model.value.type === PrimitiveTypeAllEnum.LINE ? this.getLinePoints() : this.getRectPoints();
            if (this.resizeStartPoint.index !== -1) {
                if (!(this.model.value instanceof PrimitiveInstanceSvgLine)) {
                    res.forEach((point, index) => {
                        point.visible = index === this.resizeStartPoint.index;
                    });
                } else {
                    if (!this.addedAnchor) {
                        res.forEach((point, index) => {
                            point.visible = index === this.resizeStartPoint.index;
                        });
                    } else {
                        res.forEach((point, index) => {
                            point.visible = index === this.resizeStartPoint.index + 1;
                        });
                    }
                }
            }
            if (this.rotateStatus.value !== RotatingStatus.NONE) {
                res.forEach(point => {
                    point.visible = false;
                });
            }
            return res;
        }
        return [];
    });
    public show: ComputedRef<boolean> = computed(() => {
        return !!this.model.value && !this.model.value?.invisible && !this.model.value?.layer?.invisible;
    });
    public transform: ComputedRef<string> = computed(() => {
        let transformContent = '';
        if (this.model.value && !(this.model.value instanceof PrimitiveInstanceSvgLine)) {
            const rotate = (this.model.value.attributes as ISvgAttr).rotate;
            if (rotate % 360 !== 0) {
                const {centerX, centerY} = this.model.value.getCenter();
                transformContent += `rotate(${rotate}, ${centerX}, ${centerY})`;
            }
        }
        return transformContent;
    });

    public rotatePoint: ComputedRef<IRotatePoint> = computed(() => {
        if (this.rotateStatus.value !== RotatingStatus.ROTATING) {
            let positionPoint;
            if (this.model.value && this.model.value instanceof PrimitiveInstanceSvgLine) {
                positionPoint = this.points.value[0];
            } else {
                positionPoint = this.points.value[5];
            }
            if (positionPoint) {
                return {
                    x: positionPoint.cx + 8 / this.board.zoom,
                    y: positionPoint.cy - 24 / this.board.zoom,
                    size: 16 / this.board.zoom,
                    visible: true,
                };
            }
        }
        return {
            x: 0,
            y: 0,
            size: 16 / this.board.zoom,
            visible: false,
        };
    });

    public rotatePointTransform: ComputedRef<string> = computed(() => {
        let transformContent = '';
        if (this.model.value && !(this.model.value instanceof PrimitiveInstanceSvgLine)) {
            const rotate = (this.model.value.attributes as ISvgAttr).rotate;
            if (rotate % 360 !== 0) {
                const centerX = this.rotatePoint.value.x + 8;
                const centerY = this.rotatePoint.value.y + 8;
                transformContent += `rotate(${-rotate}, ${centerX}, ${centerY})`;
            }
        }
        return transformContent;
    });

    rectPointResizeMethodList = [
        this.getYTopResize,
        this.getXRightResize,
        this.getYBottomResize,
        this.getXLeftResize,
        this.getLeftTopResize,
        this.getRightTopResize,
        this.getRightBottomResize,
        this.getLeftBottomResize,
    ].map(method => method.bind(this));

    addedAnchor = false;

    constructor(svgInstance: Svg | null, model: PrimitiveInstance | null, board: Board) {
        this.svgInstance.value = svgInstance;
        this.model.value = model;
        this.board = board;
    }

    getRectPoints() {
        const box = this.model.value?.box.box as IRectBox;
        const rotate = Utils.getRealRotate((this.model.value?.attributes as ISvgAttr).rotate);
        const cursor = this.cursors[Math.floor((rotate + 22) / 45) % 4];
        let {x, y, width, height} = box;
        const min = 17 / this.board.zoom;
        const minSpace = 20 / this.board.zoom;
        if (width < min || height < min) {
            width += minSpace;
            height += minSpace;
            x -= minSpace / 2;
            y -= minSpace / 2;
        }
        const xMid = x + width / 2;
        const yMid = y + height / 2;

        return [
            {cx: xMid, cy: y, cursor: cursor[0], visible: true, size: 5 / this.board.zoom},
            {cx: x + width, cy: yMid, cursor: cursor[1], visible: true, size: 5 / this.board.zoom},
            {cx: xMid, cy: y + height, cursor: cursor[2], visible: true, size: 5 / this.board.zoom},
            {cx: x, cy: yMid, cursor: cursor[3], visible: true, size: 5 / this.board.zoom},
            {cx: x, cy: y, cursor: cursor[4], visible: true, size: 5 / this.board.zoom},
            {cx: x + width, cy: y, cursor: cursor[5], visible: true, size: 5 / this.board.zoom},
            {cx: x + width, cy: y + height, cursor: cursor[6], visible: true, size: 5 / this.board.zoom},
            {cx: x, cy: y + height, cursor: cursor[7], visible: true, size: 5 / this.board.zoom},
        ];
    }

    getLinePoints() {
        const box = this.model.value?.box.box as ILineBox;
        const {x, y, posList} = box;
        const res: IResizePoint[] = [
            {
                cx: box.x,
                cy: box.y,
                cursor: 'pointer',
                visible: true,
                canDelete: true,
                size: 5 / this.board.zoom,
            },
        ];
        let lastX = x,
            lastY = y;
        posList.forEach((pos, index) => {
            res.push(
                {
                    cx: (lastX + pos.x) / 2,
                    cy: (lastY + pos.y) / 2,
                    cursor: 'crosshair',
                    visible: true,
                    needOpacity: true,
                    posIndex: index,
                    canDelete: false,
                    size: 5 / this.board.zoom,
                },
                {
                    cx: pos.x,
                    cy: pos.y,
                    cursor: 'crosshair',
                    visible: true,
                    canDelete: true,
                    size: 5 / this.board.zoom,
                }
            );
            lastX = pos.x;
            lastY = pos.y;
        });
        if (res.length <= 3) {
            res[res.length - 1].canDelete = false;
            res[0]?.canDelete && (res[0].canDelete = false);
        }
        return res;
    }

    getRealDy(realRotate: number, dx: number, dy: number, len: number) {
        // 移动的角度
        const alpha = Math.atan(Math.abs(dy / dx));
        // 旋转的角度
        const theta = (realRotate * Math.PI) / 180;
        // 旋转的角度和移动角度之间的角度
        let beta;
        if (dx >= 0 && dy <= 0) {
            if (theta >= Math.PI / 2 - alpha) {
                beta = theta - (Math.PI / 2 - alpha);
            } else {
                beta = Math.PI / 2 - alpha - theta;
            }
            dy = len * Math.cos(beta) * -1;
        } else if (dx >= 0 && dy > 0) {
            if (alpha + Math.PI / 2 >= theta) {
                beta = alpha + Math.PI / 2 - theta;
            } else {
                beta = theta - (alpha + Math.PI / 2);
            }
            dy = len * Math.cos(beta) * -1;
        } else if (dx < 0 && dy > 0) {
            if ((3 * Math.PI) / 2 - alpha <= theta) {
                beta = theta - ((3 * Math.PI) / 2 - alpha);
            } else {
                beta = (3 * Math.PI) / 2 - alpha - theta;
            }
            dy = len * Math.cos(beta) * -1;
        } else {
            if (alpha + (3 * Math.PI) / 2 <= theta) {
                beta = theta - (alpha + (3 * Math.PI) / 2);
            } else {
                beta = alpha + (3 * Math.PI) / 2 - theta;
            }
            dy = len * Math.cos(beta) * -1;
        }
        return dy;
    }

    getRealDx(realRotate: number, dx: number, dy: number, len: number) {
        // 移动的角度
        const alpha = Math.atan(Math.abs(dy / dx));
        // 旋转的角度
        const sideRealRotate = (realRotate + 90) % 360;
        const theta = (sideRealRotate * Math.PI) / 180;
        // 旋转的角度和移动角度之间的角度
        let beta;
        if (dx >= 0 && dy <= 0) {
            if (theta >= Math.PI / 2 - alpha) {
                beta = theta - (Math.PI / 2 - alpha);
            } else {
                beta = Math.PI / 2 - alpha - theta;
            }
            dx = len * Math.cos(beta);
        } else if (dx >= 0 && dy > 0) {
            if (alpha + Math.PI / 2 >= theta) {
                beta = alpha + Math.PI / 2 - theta;
            } else {
                beta = theta - (alpha + Math.PI / 2);
            }
            dx = len * Math.cos(beta);
        } else if (dx < 0 && dy > 0) {
            if ((3 * Math.PI) / 2 - alpha <= theta) {
                beta = theta - ((3 * Math.PI) / 2 - alpha);
            } else {
                beta = (3 * Math.PI) / 2 - alpha - theta;
            }
            dx = len * Math.cos(beta);
        } else {
            if (alpha + (3 * Math.PI) / 2 <= theta) {
                beta = theta - (alpha + (3 * Math.PI) / 2);
            } else {
                beta = alpha + (3 * Math.PI) / 2 - theta;
            }
            dx = len * Math.cos(beta);
        }
        return dx;
    }

    resizeStart(evt, point, index) {
        const {clientX, clientY} = evt;
        const position = this.svgInstance.value?.point(clientX, clientY);
        this.resizeStartPoint.point = point;
        this.resizeStartPoint.index = index;
        this.resizeStartPoint.x = position?.x || 0;
        this.resizeStartPoint.y = position?.y || 0;

        const modelPosition = this.model.value!.getPosition()!;
        const modelBoundRect = this.model.value!.getBoundRect()!;
        this.beforeResizeModelStatus = {
            x: modelPosition.x,
            y: modelPosition.y,
            width: modelBoundRect.width,
            height: modelBoundRect.height,
        };
        if (this.model.value instanceof PrimitiveInstanceSvgLine) {
            this.beforeResizeModelStatus.posList = this.model.value.attributes.posList;
        }
    }

    resizeLineFirstPoint(dx, dy, x, y, posList) {
        return {
            x: x + dx,
            y: y + dy,
            posList,
        };
    }

    resizeLineNewAnchorPoint(dx, dy, x, y, posList, posIndex, point) {
        const newPosList = JSON.parse(JSON.stringify(posList));
        const newPos = {
            x: dx + point.cx,
            y: dy + point.cy,
            type: LinePathType.L,
        };
        newPosList.splice(posIndex, 0, newPos);
        this.addedAnchor = true;
        return {
            x,
            y,
            posList: newPosList,
        };
    }

    resizeLinePoint(dx, dy, x, y, posList, index) {
        const realIndex = (index >>> 1) - 1;
        const newPosList = JSON.parse(JSON.stringify(posList));
        newPosList[realIndex].x += dx;
        newPosList[realIndex].y += dy;
        return {
            x,
            y,
            posList: newPosList,
        };
    }

    resizeLineFirstPointWithAlign(dx, dy, x, y, posList) {
        const minDisX = this.alignDistance,
            minDisY = this.alignDistance;
        let minXIndex = -1,
            minYIndex = -1;
        const resX = x + dx,
            resY = y + dy;
        posList.forEach((pos, index) => {
            const disX = Math.abs(pos.x - resX),
                disY = Math.abs(pos.y - resY);
            if (disX < minDisX) {
                minXIndex = index;
            }
            if (disY < minDisY) {
                minYIndex = index;
            }
        });
        return {
            x: minXIndex === -1 ? resX : posList[minXIndex].x,
            y: minYIndex === -1 ? resY : posList[minYIndex].y,
            posList,
        };
    }

    resizeLineNewAnchorPointWithAlign(dx, dy, x, y, posList, posIndex, point) {
        const newPosList = JSON.parse(JSON.stringify(posList));
        const resX = point.cx + dx,
            resY = point.cy + dy;
        const minDisX = this.alignDistance,
            minDisY = this.alignDistance;
        let minXIndex = -1,
            minYIndex = -1;
        newPosList.unshift({x, y});
        newPosList.forEach((pos, index) => {
            const disX = Math.abs(pos.x - resX),
                disY = Math.abs(pos.y - resY);
            if (disX < minDisX) {
                minXIndex = index;
            }
            if (disY < minDisY) {
                minYIndex = index;
            }
        });
        const newPos = {
            x: minXIndex === -1 ? resX : newPosList[minXIndex].x,
            y: minYIndex === -1 ? resY : newPosList[minYIndex].y,
            type: LinePathType.L,
        };
        newPosList.shift();
        newPosList.splice(posIndex, 0, newPos);
        this.addedAnchor = true;
        return {
            x,
            y,
            posList: newPosList,
        };
    }

    resizeLinePointWithAlign(dx, dy, x, y, posList, index) {
        const realIndex = (index >>> 1) - 1;
        const newPosList = JSON.parse(JSON.stringify(posList));
        const resX = newPosList[realIndex].x + dx,
            resY = newPosList[realIndex].y + dy;
        const minDisX = this.alignDistance,
            minDisY = this.alignDistance;
        let minXIndex = -1,
            minYIndex = -1;
        newPosList.unshift({x, y});
        newPosList.forEach((pos, index) => {
            if (index !== realIndex + 1) {
                const disX = Math.abs(pos.x - resX),
                    disY = Math.abs(pos.y - resY);
                if (disX < minDisX) {
                    minXIndex = index;
                }
                if (disY < minDisY) {
                    minYIndex = index;
                }
            }
        });
        newPosList[realIndex + 1].x = minXIndex === -1 ? resX : newPosList[minXIndex].x;
        newPosList[realIndex + 1].y = minYIndex === -1 ? resY : newPosList[minYIndex].y;
        newPosList.shift();
        return {
            x,
            y,
            posList: newPosList,
        };
    }

    resizeLine(dx: number, dy: number, isEnd: boolean) {
        const {x, y, posList} = this.beforeResizeModelStatus;
        const {point, index} = this.resizeStartPoint;
        let afterResizeModel;
        if (index === 0) {
            afterResizeModel = this.resizeLineFirstPoint(dx, dy, x, y, posList);
        } else if (point.posIndex !== undefined) {
            afterResizeModel = this.resizeLineNewAnchorPoint(dx, dy, x, y, posList, point.posIndex, point);
        } else {
            afterResizeModel = this.resizeLinePoint(dx, dy, x, y, posList, index);
        }
        if (isEnd) {
            this.model.value?.setSize(afterResizeModel.x, afterResizeModel.y, afterResizeModel.posList);
        }
        this.model.value?.setBox(afterResizeModel.x, afterResizeModel.y, afterResizeModel.posList);
    }

    resizeLineWithAlign(dx: number, dy: number, isEnd: boolean) {
        const {x, y, posList} = this.beforeResizeModelStatus;
        const {point, index} = this.resizeStartPoint;
        let afterResizeModel;
        if (index === 0) {
            afterResizeModel = this.resizeLineFirstPointWithAlign(dx, dy, x, y, posList);
        } else if (point.posIndex !== undefined) {
            afterResizeModel = this.resizeLineNewAnchorPointWithAlign(dx, dy, x, y, posList, point.posIndex, point);
        } else {
            afterResizeModel = this.resizeLinePointWithAlign(dx, dy, x, y, posList, index);
        }
        if (isEnd) {
            this.model.value?.setSize(afterResizeModel.x, afterResizeModel.y, afterResizeModel.posList);
        }
        this.model.value?.setBox(afterResizeModel.x, afterResizeModel.y, afterResizeModel.posList);
    }

    resizeRect(rotate: number, centerX: number, centerY: number, dx: number, dy: number, len: number) {
        if (this.resizeStartPoint.index === 0 || this.resizeStartPoint.index === 2) {
            if (dx !== 0 || dy !== 0) {
                dy = this.getRealDy(rotate, dx, dy, len);
            }
        } else if (this.resizeStartPoint.index === 1 || this.resizeStartPoint.index === 3) {
            if (dx !== 0 || dy !== 0) {
                dx = this.getRealDx(rotate, dx, dy, len);
            }
        }

        const {x, y, width, height} = this.beforeResizeModelStatus;
        const beforeCenterX = x + width / 2;
        const beforeCenterY = y + height / 2;
        const theta = (rotate * Math.PI) / 180;
        const reverseTheta = 2 * Math.PI - theta;
        const afterResizeModel = this.rectPointResizeMethodList[this.resizeStartPoint.index](
            x,
            y,
            width,
            height,
            dx,
            dy,
            rotate,
            theta,
            reverseTheta,
            beforeCenterX,
            beforeCenterY
        );
        this.model.value?.setBox(
            afterResizeModel.x,
            afterResizeModel.y,
            afterResizeModel.width,
            afterResizeModel.height
        );
    }

    doResize(event, isEnd = false) {
        try {
            if (this.resizeStartPoint.index === -1) return;
            const {centerX, centerY} = this.model.value!.getCenter();
            const rotate = Utils.getRealRotate(this.model.value!.attributes.rotate);
            const position = this.svgInstance.value!.point(event.clientX, event.clientY)!;
            const dx = position.x - this.resizeStartPoint.x;
            const dy = position.y - this.resizeStartPoint.y;
            if (dx === 0 && dy === 0) return;
            if (this.model.value?.type === PrimitiveTypeAllEnum.LINE) {
                if (!event.ctrlKey && !event.altKey && !event.metaKey) {
                    if (event.shiftKey) {
                        this.resizeLineWithAlign(dx, dy, isEnd);
                    } else {
                        this.resizeLine(dx, dy, isEnd);
                    }
                }
            } else {
                const len = (dx ** 2 + dy ** 2) ** 0.5;
                this.resizeRect(rotate, centerX, centerY, dx, dy, len);
            }
        } catch (e: any) {
            debugWarn(e);
        }
    }

    resizing(event) {
        requestFrame.next(() => {
            this.doResize(event);
        });
    }

    getYTopResize(x, y, width, height, dx, dy, rotate, theta, reverseTheta, centerX, centerY) {
        let newHeight = height - dy;
        let newCenterX, newCenterY, newX, newY;
        // 如果缩小至整个矩形上下对调
        if (newHeight < 0) {
            newHeight = Math.abs(newHeight);
            // 以原矩形的左下角的坐标作为新的坐标，计算旋转后的虚拟坐标
            const virtualX =
                (x - centerX) * Math.cos(reverseTheta) + (y + height - centerY) * Math.sin(reverseTheta) + centerX;
            const virtualY =
                -1 * (x - centerX) * Math.sin(reverseTheta) + (y + height - centerY) * Math.cos(reverseTheta) + centerY;
            // 分情况讨论
            // 如果旋转角度在第一象限
            if (rotate >= 0 && rotate < 90) {
                newCenterX = centerX - (dy * Math.sin(theta)) / 2;
                newCenterY = centerY + (dy * Math.cos(theta)) / 2;
            }
            // 如果旋转角度在第二象限
            else if (rotate >= 90 && rotate < 180) {
                newCenterX = centerX - (dy * Math.cos(theta - Math.PI / 2)) / 2;
                newCenterY = centerY - (dy * Math.sin(theta - Math.PI / 2)) / 2;
            }
            // 如果旋转角度在第三象限
            else if (rotate >= 180 && rotate < 270) {
                newCenterX = centerX + (dy * Math.sin(theta - Math.PI)) / 2;
                newCenterY = centerY - (dy * Math.cos(theta - Math.PI)) / 2;
            }
            // 如果旋转角度在第四象限
            else {
                newCenterX = centerX + (dy * Math.cos(theta - Math.PI * 1.5)) / 2;
                newCenterY = centerY + (dy * Math.sin(theta - Math.PI * 1.5)) / 2;
            }
            // 计算得到新的旋转中心坐标之后，再将虚拟坐标逆旋转回去，得到真实坐标
            newX = (virtualX - newCenterX) * Math.cos(theta) + (virtualY - newCenterY) * Math.sin(theta) + newCenterX;
            newY =
                -1 * (virtualX - newCenterX) * Math.sin(theta) + (virtualY - newCenterY) * Math.cos(theta) + newCenterY;
        } else {
            // 计算缩放前的图元坐标对应的旋转后的虚拟坐标的位置
            const virtualX = (x - centerX) * Math.cos(reverseTheta) + (y - centerY) * Math.sin(reverseTheta) + centerX;
            const virtualY =
                -1 * (x - centerX) * Math.sin(reverseTheta) + (y - centerY) * Math.cos(reverseTheta) + centerY;
            let newVirtualX, newVirtualY;
            // 由于拉动的是图元的上边，所以会影响坐标，所以计算出拉动后的图元左上角顶点的虚拟坐标和图元新的旋转中心
            if (rotate >= 0 && rotate < 90) {
                newCenterX = centerX - (dy * Math.sin(theta)) / 2;
                newCenterY = centerY + (dy * Math.cos(theta)) / 2;
                newVirtualX = virtualX - dy * Math.sin(theta);
                newVirtualY = virtualY + dy * Math.cos(theta);
            } else if (rotate >= 90 && rotate < 180) {
                newCenterX = centerX - (dy * Math.cos(theta - Math.PI / 2)) / 2;
                newCenterY = centerY - (dy * Math.sin(theta - Math.PI / 2)) / 2;
                newVirtualX = virtualX - dy * Math.cos(theta - Math.PI / 2);
                newVirtualY = virtualY - dy * Math.sin(theta - Math.PI / 2);
            } else if (rotate >= 180 && rotate < 270) {
                newCenterX = centerX + (dy * Math.sin(theta - Math.PI)) / 2;
                newCenterY = centerY - (dy * Math.cos(theta - Math.PI)) / 2;
                newVirtualX = virtualX + dy * Math.sin(theta - Math.PI);
                newVirtualY = virtualY - dy * Math.cos(theta - Math.PI);
            } else {
                newCenterX = centerX + (dy * Math.cos(theta - Math.PI * 1.5)) / 2;
                newCenterY = centerY + (dy * Math.sin(theta - Math.PI * 1.5)) / 2;
                newVirtualX = virtualX + dy * Math.cos(theta - Math.PI * 1.5);
                newVirtualY = virtualY + dy * Math.sin(theta - Math.PI * 1.5);
            }
            // 计算得到新的旋转中心坐标之后，再将虚拟坐标逆旋转回去，得到真实坐标
            newX =
                (newVirtualX - newCenterX) * Math.cos(theta) +
                (newVirtualY - newCenterY) * Math.sin(theta) +
                newCenterX;
            newY =
                -1 * (newVirtualX - newCenterX) * Math.sin(theta) +
                (newVirtualY - newCenterY) * Math.cos(theta) +
                newCenterY;
        }
        return {x: newX, y: newY, width, height: newHeight};
    }

    getYBottomResize(x, y, width, height, dx, dy, rotate, theta, reverseTheta, centerX, centerY) {
        let newHeight = height + dy;

        let newCenterX, newCenterY, newX, newY;
        if (newHeight < 0) {
            newHeight = Math.abs(newHeight);
            // 下边界向上拉动超过图元本身的高时，会出现下边界变成上边界的情况，所以此时图元的虚拟坐标会发生变化，需要同时计算虚拟坐标和新的旋转中心
            const virtualX =
                (x - centerX) * Math.cos(reverseTheta) + (y + height - centerY) * Math.sin(reverseTheta) + centerX;
            const virtualY =
                -1 * (x - centerX) * Math.sin(reverseTheta) + (y + height - centerY) * Math.cos(reverseTheta) + centerY;
            let newVirtualX, newVirtualY;
            if (rotate >= 0 && rotate < 90) {
                newCenterX = centerX - (dy * Math.sin(theta)) / 2;
                newCenterY = centerY + (dy * Math.cos(theta)) / 2;
                newVirtualX = virtualX - dy * Math.sin(theta);
                newVirtualY = virtualY + dy * Math.cos(theta);
            } else if (rotate >= 90 && rotate < 180) {
                newCenterX = centerX - (dy * Math.cos(theta - Math.PI / 2)) / 2;
                newCenterY = centerY - (dy * Math.sin(theta - Math.PI / 2)) / 2;
                newVirtualX = virtualX - dy * Math.cos(theta - Math.PI / 2);
                newVirtualY = virtualY - dy * Math.sin(theta - Math.PI / 2);
            } else if (rotate >= 180 && rotate < 270) {
                newCenterX = centerX + (dy * Math.sin(theta - Math.PI)) / 2;
                newCenterY = centerY - (dy * Math.cos(theta - Math.PI)) / 2;
                newVirtualX = virtualX + dy * Math.sin(theta - Math.PI);
                newVirtualY = virtualY - dy * Math.cos(theta - Math.PI);
            } else {
                newCenterX = centerX + (dy * Math.cos(theta - Math.PI * 1.5)) / 2;
                newCenterY = centerY + (dy * Math.sin(theta - Math.PI * 1.5)) / 2;
                newVirtualX = virtualX + dy * Math.cos(theta - Math.PI * 1.5);
                newVirtualY = virtualY + dy * Math.sin(theta - Math.PI * 1.5);
            }
            newX =
                (newVirtualX - newCenterX) * Math.cos(theta) +
                (newVirtualY - newCenterY) * Math.sin(theta) +
                newCenterX;
            newY =
                -1 * (newVirtualX - newCenterX) * Math.sin(theta) +
                (newVirtualY - newCenterY) * Math.cos(theta) +
                newCenterY;
        } else {
            // 下边界的拉动不会影响图元虚拟坐标的位置，所以只需要计算新的旋转中心
            const virtualX = (x - centerX) * Math.cos(reverseTheta) + (y - centerY) * Math.sin(reverseTheta) + centerX;
            const virtualY =
                -1 * (x - centerX) * Math.sin(reverseTheta) + (y - centerY) * Math.cos(reverseTheta) + centerY;
            if (rotate >= 0 && rotate < 90) {
                newCenterX = centerX - (dy * Math.sin(theta)) / 2;
                newCenterY = centerY + (dy * Math.cos(theta)) / 2;
            } else if (rotate >= 90 && rotate < 180) {
                newCenterX = centerX - (dy * Math.cos(theta - Math.PI / 2)) / 2;
                newCenterY = centerY - (dy * Math.sin(theta - Math.PI / 2)) / 2;
            } else if (rotate >= 180 && rotate < 270) {
                newCenterX = centerX + (dy * Math.sin(theta - Math.PI)) / 2;
                newCenterY = centerY - (dy * Math.cos(theta - Math.PI)) / 2;
            } else {
                newCenterX = centerX + (dy * Math.cos(theta - Math.PI * 1.5)) / 2;
                newCenterY = centerY + (dy * Math.sin(theta - Math.PI * 1.5)) / 2;
            }
            newX = (virtualX - newCenterX) * Math.cos(theta) + (virtualY - newCenterY) * Math.sin(theta) + newCenterX;
            newY =
                -1 * (virtualX - newCenterX) * Math.sin(theta) + (virtualY - newCenterY) * Math.cos(theta) + newCenterY;
        }
        return {x: newX, y: newY, width, height: newHeight};
    }

    getXLeftResize(x, y, width, height, dx, dy, rotate, theta, reverseTheta, centerX, centerY) {
        let newWidth = width - dx;

        let newCenterX, newCenterY, newX, newY;

        if (newWidth < 0) {
            newWidth = Math.abs(newWidth);
            // 向右拉伸超过了图元的宽，导致虚拟坐标变为原图元右上角的点的坐标，只需要重新计算旋转中心
            const virtualX =
                (x + width - centerX) * Math.cos(reverseTheta) + (y - centerY) * Math.sin(reverseTheta) + centerX;
            const virtualY =
                -1 * (x + width - centerX) * Math.sin(reverseTheta) + (y - centerY) * Math.cos(reverseTheta) + centerY;
            // 分情况讨论
            // 如果旋转角度在第一象限
            if (rotate >= 0 && rotate < 90) {
                newCenterX = centerX + (dx * Math.cos(theta)) / 2;
                newCenterY = centerY + (dx * Math.sin(theta)) / 2;
            }
            // 如果旋转角度在第二象限
            else if (rotate >= 90 && rotate < 180) {
                newCenterX = centerX - (dx * Math.sin(theta - Math.PI / 2)) / 2;
                newCenterY = centerY + (dx * Math.cos(theta - Math.PI / 2)) / 2;
            }
            // 如果旋转角度在第三象限
            else if (rotate >= 180 && rotate < 270) {
                newCenterX = centerX - (dx * Math.cos(theta - Math.PI)) / 2;
                newCenterY = centerY - (dx * Math.sin(theta - Math.PI)) / 2;
            }
            // 如果旋转角度在第四象限
            else {
                newCenterX = centerX + (dx * Math.sin(theta - Math.PI * 1.5)) / 2;
                newCenterY = centerY - (dx * Math.cos(theta - Math.PI * 1.5)) / 2;
            }
            // 计算得到新的旋转中心坐标之后，再将虚拟坐标逆旋转回去，得到真实坐标
            newX = (virtualX - newCenterX) * Math.cos(theta) + (virtualY - newCenterY) * Math.sin(theta) + newCenterX;
            newY =
                -1 * (virtualX - newCenterX) * Math.sin(theta) + (virtualY - newCenterY) * Math.cos(theta) + newCenterY;
        } else {
            // 左边界向左拉动，所以此时图元的虚拟坐标会发生变化，需要同时计算虚拟坐标和新的旋转中心
            const virtualX = (x - centerX) * Math.cos(reverseTheta) + (y - centerY) * Math.sin(reverseTheta) + centerX;
            const virtualY =
                -1 * (x - centerX) * Math.sin(reverseTheta) + (y - centerY) * Math.cos(reverseTheta) + centerY;
            let newVirtualX, newVirtualY;
            if (rotate >= 0 && rotate < 90) {
                newCenterX = centerX + (dx * Math.cos(theta)) / 2;
                newCenterY = centerY + (dx * Math.sin(theta)) / 2;
                newVirtualX = virtualX + dx * Math.cos(theta);
                newVirtualY = virtualY + dx * Math.sin(theta);
            } else if (rotate >= 90 && rotate < 180) {
                newCenterX = centerX - (dx * Math.sin(theta - Math.PI / 2)) / 2;
                newCenterY = centerY + (dx * Math.cos(theta - Math.PI / 2)) / 2;
                newVirtualX = virtualX - dx * Math.sin(theta - Math.PI / 2);
                newVirtualY = virtualY + dx * Math.cos(theta - Math.PI / 2);
            } else if (rotate >= 180 && rotate < 270) {
                newCenterX = centerX - (dx * Math.cos(theta - Math.PI)) / 2;
                newCenterY = centerY - (dx * Math.sin(theta - Math.PI)) / 2;
                newVirtualX = virtualX - dx * Math.cos(theta - Math.PI);
                newVirtualY = virtualY - dx * Math.sin(theta - Math.PI);
            } else {
                newCenterX = centerX + (dx * Math.sin(theta - Math.PI * 1.5)) / 2;
                newCenterY = centerY - (dx * Math.cos(theta - Math.PI * 1.5)) / 2;
                newVirtualX = virtualX + dx * Math.sin(theta - Math.PI * 1.5);
                newVirtualY = virtualY - dx * Math.cos(theta - Math.PI * 1.5);
            }
            newX =
                (newVirtualX - newCenterX) * Math.cos(theta) +
                (newVirtualY - newCenterY) * Math.sin(theta) +
                newCenterX;
            newY =
                -1 * (newVirtualX - newCenterX) * Math.sin(theta) +
                (newVirtualY - newCenterY) * Math.cos(theta) +
                newCenterY;
        }
        return {x: newX, y: newY, width: newWidth, height};
    }

    getXRightResize(x, y, width, height, dx, dy, rotate, theta, reverseTheta, centerX, centerY) {
        let newWidth = width + dx;

        let newCenterX, newCenterY, newX, newY;
        if (newWidth < 0) {
            newWidth = Math.abs(newWidth);
            // 右边界向左拉动超过图元本身的宽时，会出现右边界变成左边界的情况，所以此时图元的虚拟坐标会发生变化，需要同时计算虚拟坐标和新的旋转中心
            const virtualX =
                (x + width - centerX) * Math.cos(reverseTheta) + (y - centerY) * Math.sin(reverseTheta) + centerX;
            const virtualY =
                -1 * (x + width - centerX) * Math.sin(reverseTheta) + (y - centerY) * Math.cos(reverseTheta) + centerY;
            let newVirtualX, newVirtualY;
            if (rotate >= 0 && rotate < 90) {
                newCenterX = centerX + (dx * Math.cos(theta)) / 2;
                newCenterY = centerY + (dx * Math.sin(theta)) / 2;
                newVirtualX = virtualX + dx * Math.cos(theta);
                newVirtualY = virtualY + dx * Math.sin(theta);
            } else if (rotate >= 90 && rotate < 180) {
                newCenterX = centerX - (dx * Math.sin(theta - Math.PI / 2)) / 2;
                newCenterY = centerY + (dx * Math.cos(theta - Math.PI / 2)) / 2;
                newVirtualX = virtualX - dx * Math.sin(theta - Math.PI / 2);
                newVirtualY = virtualY + dx * Math.cos(theta - Math.PI / 2);
            } else if (rotate >= 180 && rotate < 270) {
                newCenterX = centerX - (dx * Math.cos(theta - Math.PI)) / 2;
                newCenterY = centerY - (dx * Math.sin(theta - Math.PI)) / 2;
                newVirtualX = virtualX - dx * Math.cos(theta - Math.PI);
                newVirtualY = virtualY - dx * Math.sin(theta - Math.PI);
            } else {
                newCenterX = centerX + (dx * Math.sin(theta - Math.PI * 1.5)) / 2;
                newCenterY = centerY - (dx * Math.cos(theta - Math.PI * 1.5)) / 2;
                newVirtualX = virtualX + dx * Math.sin(theta - Math.PI * 1.5);
                newVirtualY = virtualY - dx * Math.cos(theta - Math.PI * 1.5);
            }
            newX =
                (newVirtualX - newCenterX) * Math.cos(theta) +
                (newVirtualY - newCenterY) * Math.sin(theta) +
                newCenterX;
            newY =
                -1 * (newVirtualX - newCenterX) * Math.sin(theta) +
                (newVirtualY - newCenterY) * Math.cos(theta) +
                newCenterY;
        } else {
            // 向右拉伸，不会更改虚拟坐标的位置，只需要计算新的旋转中心
            const virtualX = (x - centerX) * Math.cos(reverseTheta) + (y - centerY) * Math.sin(reverseTheta) + centerX;
            const virtualY =
                -1 * (x - centerX) * Math.sin(reverseTheta) + (y - centerY) * Math.cos(reverseTheta) + centerY;
            // 分情况讨论
            // 如果旋转角度在第一象限
            if (rotate >= 0 && rotate < 90) {
                newCenterX = centerX + (dx * Math.cos(theta)) / 2;
                newCenterY = centerY + (dx * Math.sin(theta)) / 2;
            }
            // 如果旋转角度在第二象限
            else if (rotate >= 90 && rotate < 180) {
                newCenterX = centerX - (dx * Math.sin(theta - Math.PI / 2)) / 2;
                newCenterY = centerY + (dx * Math.cos(theta - Math.PI / 2)) / 2;
            }
            // 如果旋转角度在第三象限
            else if (rotate >= 180 && rotate < 270) {
                newCenterX = centerX - (dx * Math.cos(theta - Math.PI)) / 2;
                newCenterY = centerY - (dx * Math.sin(theta - Math.PI)) / 2;
            }
            // 如果旋转角度在第四象限
            else {
                newCenterX = centerX + (dx * Math.sin(theta - Math.PI * 1.5)) / 2;
                newCenterY = centerY - (dx * Math.cos(theta - Math.PI * 1.5)) / 2;
            }
            // 计算得到新的旋转中心坐标之后，再将虚拟坐标逆旋转回去，得到真实坐标
            newX = (virtualX - newCenterX) * Math.cos(theta) + (virtualY - newCenterY) * Math.sin(theta) + newCenterX;
            newY =
                -1 * (virtualX - newCenterX) * Math.sin(theta) + (virtualY - newCenterY) * Math.cos(theta) + newCenterY;
        }
        return {x: newX, y: newY, width: newWidth, height};
    }

    getLeftTopResize(x, y, width, height, dx, dy, rotate, theta, reverseTheta, centerX, centerY) {
        const {x: avx, y: avy} = Utils.getRotateAnglePos(x, y, reverseTheta, centerX, centerY);
        const {x: cvx, y: cvy} = Utils.getRotateAnglePos(x + width, y + height, reverseTheta, centerX, centerY);
        const newAvx = avx + dx;
        const newAvy = avy + dy;
        const newCenterX = (newAvx + cvx) / 2;
        const newCenterY = (newAvy + cvy) / 2;
        const {x: newAx, y: newAy} = Utils.getRotateAnglePos(newAvx, newAvy, theta, newCenterX, newCenterY);
        const {x: newCx, y: newCy} = Utils.getRotateAnglePos(cvx, cvy, theta, newCenterX, newCenterY);
        const newWidth = Math.abs(newAx - newCx);
        const newHeight = Math.abs(newAy - newCy);
        const newX = newCenterX - newWidth / 2;
        const newY = newCenterY - newHeight / 2;
        return {x: newX, y: newY, width: newWidth, height: newHeight};
    }

    getRightTopResize(x, y, width, height, dx, dy, rotate, theta, reverseTheta, centerX, centerY) {
        const {x: bvx, y: bvy} = Utils.getRotateAnglePos(x + width, y, reverseTheta, centerX, centerY);
        const {x: dvx, y: dvy} = Utils.getRotateAnglePos(x, y + height, reverseTheta, centerX, centerY);
        const newBvx = bvx + dx;
        const newBvy = bvy + dy;
        const newCenterX = (newBvx + dvx) / 2;
        const newCenterY = (newBvy + dvy) / 2;
        const {x: newBx, y: newBy} = Utils.getRotateAnglePos(newBvx, newBvy, theta, newCenterX, newCenterY);
        const {x: newDx, y: newDy} = Utils.getRotateAnglePos(dvx, dvy, theta, newCenterX, newCenterY);
        const newWidth = Math.abs(newBx - newDx);
        const newHeight = Math.abs(newBy - newDy);
        const newX = newCenterX - newWidth / 2;
        const newY = newCenterY - newHeight / 2;
        return {x: newX, y: newY, width: newWidth, height: newHeight};
    }

    getRightBottomResize(x, y, width, height, dx, dy, rotate, theta, reverseTheta, centerX, centerY) {
        const {x: cvx, y: cvy} = Utils.getRotateAnglePos(x + width, y + height, reverseTheta, centerX, centerY);
        const {x: avx, y: avy} = Utils.getRotateAnglePos(x, y, reverseTheta, centerX, centerY);
        const newCvx = cvx + dx;
        const newCvy = cvy + dy;
        const newCenterX = (newCvx + avx) / 2;
        const newCenterY = (newCvy + avy) / 2;
        const {x: newCx, y: newCy} = Utils.getRotateAnglePos(newCvx, newCvy, theta, newCenterX, newCenterY);
        const {x: newAx, y: newAy} = Utils.getRotateAnglePos(avx, avy, theta, newCenterX, newCenterY);
        const newWidth = Math.abs(newCx - newAx);
        const newHeight = Math.abs(newCy - newAy);
        const newX = newCenterX - newWidth / 2;
        const newY = newCenterY - newHeight / 2;
        return {x: newX, y: newY, width: newWidth, height: newHeight};
    }

    getLeftBottomResize(x, y, width, height, dx, dy, rotate, theta, reverseTheta, centerX, centerY) {
        const {x: dvx, y: dvy} = Utils.getRotateAnglePos(x, y + height, reverseTheta, centerX, centerY);
        const {x: bvx, y: bvy} = Utils.getRotateAnglePos(x + width, y, reverseTheta, centerX, centerY);
        const newDvx = dvx + dx;
        const newDvy = dvy + dy;
        const newCenterX = (newDvx + bvx) / 2;
        const newCenterY = (newDvy + bvy) / 2;
        const {x: newDx, y: newDy} = Utils.getRotateAnglePos(newDvx, newDvy, theta, newCenterX, newCenterY);
        const {x: newBx, y: newBy} = Utils.getRotateAnglePos(bvx, bvy, theta, newCenterX, newCenterY);
        const newWidth = Math.abs(newDx - newBx);
        const newHeight = Math.abs(newDy - newBy);
        const newX = newCenterX - newWidth / 2;
        const newY = newCenterY - newHeight / 2;
        return {x: newX, y: newY, width: newWidth, height: newHeight};
    }

    resizeEnd(event) {
        requestFrame.cancel();
        this.doResize(event, true);
        this.resizeStartPoint.index = -1;
        this.addedAnchor = false;
    }

    setPrimitiveModel(model: PrimitiveInstance) {
        this.model.value = model;
    }

    setSvgInstance(svgInstance: Svg) {
        this.svgInstance.value = svgInstance;
    }

    deletePoint(evt, point, index) {
        if (!point.canDelete) {
            return;
        }
        if (index === 0) {
            (this.model.value as PrimitiveInstanceSvgLine).deleteStartPoint();
        } else {
            (this.model.value as PrimitiveInstanceSvgLine).deleteOtherPoint((index >>> 1) - 1);
        }
    }

    setRotate(rotate) {
        if (this.rotateStatus.value === RotatingStatus.ROTATING) {
            (this.model.value as PrimitiveInstanceSvgLine).setRotateBox(rotate);
        } else {
            this.model.value?.setRotate(rotate);
        }
    }

    doLineRotate(evt) {
        const {centerX, centerY} = this.model.value!.getCenter();
        const position = this.model.value!.getPosition();
        const {clientX, clientY} = evt;
        const point = this.svgInstance.value!.point(clientX, clientY);
        const dx = point.x - this.rotateInfo.startX;
        const dy = point.y - this.rotateInfo.startY;
        const movedX = position.x + dx;
        const movedY = position.y + dy;
        let theta = Utils.getRotateAngle(centerX, centerY, position.x, position.y, movedX, movedY);
        const remain = theta % 5;
        if (Math.abs(remain) <= 2) {
            if (remain < 0) {
                theta = theta + Math.abs(remain);
            } else {
                theta = theta - remain;
            }
            if (theta === -180) {
                theta = 180;
            }
            this.setRotate(theta);
        } else if (Math.abs(remain) >= 3) {
            if (remain < 0) {
                theta = theta - 5 + Math.abs(remain);
            } else {
                theta = theta + 5 - remain;
            }
            if (theta === -180) {
                theta = 180;
            }
            this.setRotate(theta);
        }
    }

    doRectRotate(evt) {
        const {centerX, centerY} = this.model.value!.getCenter();
        const maxX = this.model.value!.getMaxX();
        const minY = this.model.value!.getMinY();
        const {clientX, clientY} = evt;
        const point = this.svgInstance.value!.point(clientX, clientY);
        const dx = point.x - this.rotateInfo.startX;
        const dy = point.y - this.rotateInfo.startY;
        const movedX = maxX + dx;
        const movedY = minY + dy;
        let theta = Utils.getRotateAngle(centerX, centerY, maxX, minY, movedX, movedY);
        const remain = theta % 5;
        if (Math.abs(remain) <= 2) {
            if (remain < 0) {
                theta = theta + Math.abs(remain);
            } else {
                theta = theta - remain;
            }
            if (theta === -180) {
                theta = 180;
            }
            this.model.value?.setRotate(theta);
        } else if (Math.abs(remain) >= 3) {
            if (remain < 0) {
                theta = theta - 5 + Math.abs(remain);
            } else {
                theta = theta + 5 - remain;
            }
            if (theta === -180) {
                theta = 180;
            }
            this.model.value?.setRotate(theta);
        }
    }

    doRotate(evt) {
        if (this.model.value?.type === PrimitiveTypeAllEnum.LINE) {
            this.doLineRotate(evt);
        } else {
            this.doRectRotate(evt);
        }
    }

    rotating(evt) {
        requestFrame.next(() => {
            this.rotateStatus.value = RotatingStatus.ROTATING;
            this.doRotate(evt);
        });
    }

    rotateStart(evt) {
        this.rotateStatus.value = RotatingStatus.STARTED;
        this.rotateInfo.startX = this.rotatePoint.value.x + this.rotatePoint.value.size / 2;
        this.rotateInfo.startY = this.rotatePoint.value.y + this.rotatePoint.value.size / 2;
        this.rotateInfo.rotate = this.model.value!.attributes.rotate ?? 0;
    }

    rotateEnd(evt) {
        if (this.rotateStatus.value === RotatingStatus.ROTATING) {
            this.rotateStatus.value = RotatingStatus.NONE;
            requestFrame.cancel();
            this.doRotate(evt);
        } else {
            this.rotateStatus.value = RotatingStatus.NONE;
        }
    }
}
