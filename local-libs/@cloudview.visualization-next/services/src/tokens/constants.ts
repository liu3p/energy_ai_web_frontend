import type {InjectionKey, Ref} from 'vue';
import type {Board, Configuration, Observer, Primitive, PrimitiveInstance} from '../classes';

export const VisRouteNames = {
    PRIMITIVE_MGT: Symbol(),
    PRIMITIVE_EDITOR: Symbol(),
    CONFIGURATION_MGT: Symbol(),
    CONFIGURATION_EDITOR: Symbol(),
    CONFIGURATION_BROWSER: Symbol(),
};

export const Topics = {
    EDITED: Symbol(),
    ACTIVE_BOARD_CHANGED: Symbol(),
    SHOW_BOARD_OR_PRIMITIVE_ATTR: Symbol(),
    PROVIDE_BOARD_ATTR: Symbol(),
    PROVIDE_PRIMITIVE_ATTR: Symbol(),
    SHOW_LAYER: Symbol(),
    PROVIDE_LAYER_INFO: Symbol(),
    BOARD_READY: Symbol(),
    SELECTED_LAYER_CHANGED: Symbol(),
    SELECT_SINGLE_PRIMITIVE: Symbol(),
    VIEWBOX_CHANGED: Symbol(),
    SHOW_BINDING: Symbol(),
    SHOW_EDITOR_RIGHT_ADDITION_WINDOW: Symbol(),
    LAYER_DELETED: Symbol(),
};

export const EditorMenuKey = {
    ATTR: Symbol(),
    LAYER: Symbol(),
    BOARD_ARGS: Symbol(),
};

export enum AttrTypeEnum {
    BOOLEAN = 'bool',
    TEXT = 'text',
    COLOR = 'color',
    NUMBER = 'number',
    SELECT = 'select',
    STROKE_DASHARRAY = 'strokeDasharray',
    LINE_ARROW = 'lineArrow',
}

export const observerKey: InjectionKey<Observer> = Symbol();

export const dragPrimitiveInfo: InjectionKey<Primitive> = Symbol();
export const editConfiguration: InjectionKey<Ref<Configuration>> = Symbol();
export const editBoard: InjectionKey<Ref<Board>> = Symbol();
export const editPrimitive: InjectionKey<Ref<PrimitiveInstance>> = Symbol();

export const InsertBindingsKey = 'insertBindings';
export const InsertValuePrefix = 'insertValue_';

export const eventNames = ['click', 'dblclick', 'mouseenter', 'mouseleave'];

export const MovingTypes = {
    MULTI_SELECT: Symbol(),
    MOVE: Symbol(),
    RESIZE: Symbol(),
    PAN: Symbol(),
    NONE: Symbol(),
};

export const SvgAttrs = new Set([
    'x',
    'y',
    'width',
    'height',
    'fill',
    'stroke',
    'stroke-width',
    'stroke-dasharray',
    'fill-opacity',
    'opacity',
]);

export const predefineColors = [
    'rgba(255,0,0,1)',
    'rgba(255,255,0,1)',
    'rgba(0,255,0,1)',
    'rgba(0,255,255,1)',
    'rgba(0,0,255,1)',
    'rgba(255,0,255,1)',
    'rgba(128,128,128,1)',
    'rgba(255,255,255,1)',
    'rgba(0,0,0,1)',
];

export const statusPrefix = 'status-';

export const alignDirection = {
    LEFT: Symbol(),
    RIGHT: Symbol(),
    TOP: Symbol(),
    BOTTOM: Symbol(),
    MIDDLE: Symbol(),
    CENTER: Symbol(),
};

export const distributeType = {
    HORIZONTAL: Symbol(),
    VERTICAL: Symbol(),
};

export const systemNames = {
    WINDOWS: Symbol(),
    MAC: Symbol(),
    OTHER: Symbol(),
};

export const moveDirection = {
    ArrowUp: Symbol(),
    ArrowDown: Symbol(),
    ArrowLeft: Symbol(),
    ArrowRight: Symbol(),
};

export enum LinePathType {
    L = 'L',
    LD = 'l',
    M = 'M',
    C = 'C',
    CD = 'c',
    H = 'H',
    HD = 'h',
}

export const RotatingStatus = {
    NONE: Symbol(),
    STARTED: Symbol(),
    ROTATING: Symbol(),
};
