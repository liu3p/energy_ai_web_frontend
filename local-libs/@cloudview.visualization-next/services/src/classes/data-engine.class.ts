import {Observer} from './observer.class';
import type {ConfigurationRuntime} from './configuration-runtime.class';
import type {BoardRuntime} from './board-runtime.class';
import type {
    IBindingBoardArgs,
    IBindingBoardToggle,
    IBindingCustomAction,
    IBindingCustomComponent,
    IBindingCustomData,
    IBindingCustomSubscribe,
    IBindingDeviceInfo,
    IBindingDeviceState,
    IBindingDialog,
    IBindingLinkTo,
    IBindingLinkToConfiguration,
    IBindingPopover,
    IBindingPrimitiveProp,
    IBindingScript,
    IBindingTeleindication,
    IBindingTelemetry,
    IBindingTelepulse,
    IBindingValue,
    ICustomDefinition,
    ICustomSubscriptionDefinition,
    IDevicePropPayload,
    IDeviceStatePayload,
    ISubscribeBinding,
    ITeleindicationPayload,
    ITelemetryPayload,
    ITelepulsePayload,
} from '../types';
import {DataBindingTypeEnum, DataEngineEvent, ITopicTypeEnum} from '../types';
import {PlayerError} from './player-error.class';
import {MqttClient, MqttClientError, MqttClientEvent} from './mqtt-client.class';
import type {PrimitiveInstance} from './instance-primitive.class';
import {Utils} from '../tools';
import {DeviceApi} from '../apis';
import type {Response} from 'cloudview.ui-next';

interface ITopicBindingAddition {
    primitive: PrimitiveInstance;
    attr: string;
    customFormatter?: ICustomSubscriptionDefinition['formatter'];
}

type ITopicBinding = (ISubscribeBinding | IBindingCustomSubscribe) & ITopicBindingAddition;

export interface Timer {
    timeout: number[];
    interval: number[];
}

interface IDeviceBindingList {
    [DataBindingTypeEnum.TELEMETRY]?: Record<string, Record<string, (IBindingTelemetry & ITopicBindingAddition)[]>>;
    [DataBindingTypeEnum.TELEINDICATION]?: Record<
        string,
        Record<string, (IBindingTeleindication & ITopicBindingAddition)[]>
    >;
    [DataBindingTypeEnum.TELEPULSE]?: Record<string, Record<string, (IBindingTelepulse & ITopicBindingAddition)[]>>;
    [DataBindingTypeEnum.DEVICE_STATE]?: Record<string, (IBindingDeviceState & ITopicBindingAddition)[]>;
}

type IBindingStrategy = (primitive: PrimitiveInstance, key: string) => void | Promise<void>;

export class DataEngine extends Observer {
    configuration: ConfigurationRuntime;
    board: BoardRuntime;
    mqttClient: MqttClient;
    topicBindings: Map<string, ITopicBinding[]> = new Map();
    customBindings: ICustomDefinition;
    bindingStrategies: Record<DataBindingTypeEnum, IBindingStrategy>;
    topicPre: string;
    timer: Timer;
    static topicTypeMap = {
        [DataBindingTypeEnum.TELEMETRY]: 'tm',
        [DataBindingTypeEnum.TELEINDICATION]: 'ts',
        [DataBindingTypeEnum.TELEPULSE]: 'tp',
        [DataBindingTypeEnum.DEVICE_STATE]: 'state',
        [DataBindingTypeEnum.DEVICE_PROP]: 'prop',
    } as const;

    static getPropOrTelemetryValue(payload: ITelemetryPayload | IDevicePropPayload) {
        switch (payload.data_type) {
            case 'str':
                return payload.str_value ?? '';
            case 'object':
                return payload.obj_value;
            default:
                return payload.numeric_value === null ? null : Utils.formatDecimal(payload.numeric_value, 2);
        }
    }

    static getTopicValue: Record<ITopicTypeEnum, (topic: any) => unknown> = {
        [ITopicTypeEnum.TELEMETRY]: DataEngine.getPropOrTelemetryValue,
        [ITopicTypeEnum.DEVICE_PROP]: DataEngine.getPropOrTelemetryValue,
        [ITopicTypeEnum.TELEINDICATION]: (payload: ITeleindicationPayload) => Utils.formatDecimal(payload.value, 2),
        [ITopicTypeEnum.TELEPULSE]: (payload: ITelepulsePayload) => Utils.formatDecimal(payload.numeric_value, 2),
        [ITopicTypeEnum.DEVICE_STATE]: (payload: IDeviceStatePayload) => payload.state,
    };

    constructor({
        configuration,
        board,
        customBindings,
        timer,
        mqttClient,
        topicPre = '',
    }: {
        configuration: ConfigurationRuntime;
        board: BoardRuntime;
        topicPre: string;
        customBindings: ICustomDefinition;
        timer: Timer;
        mqttClient: MqttClient;
    }) {
        super();
        this.configuration = configuration;
        this.board = board;
        this.topicPre = topicPre;
        this.customBindings = customBindings;
        this.timer = timer;
        this.mqttClient = mqttClient;
        this.bindingStrategies = this.createStrategy();
    }

    protected convertValue(value: unknown, convertDefinition: string, primitive: PrimitiveInstance, key: string) {
        if (convertDefinition != '') {
            try {
                return new Function('$board', '$primitive', '$value', '$setTimeout', '$setInterval', convertDefinition)(
                    {
                        getAttr: this.board.getBoardArg.bind(this.board),
                        setAttr: this.board.setBoardArg.bind(this.board),
                    },
                    {
                        getAttr: primitive.getAttribute.bind(primitive),
                        setAttr: primitive.setAttribute.bind(primitive),
                    },
                    value,
                    (callback: () => void, time: number, ...args) =>
                        this.timer.timeout.push(window.setTimeout(callback, time, ...args)),
                    (callback: () => void, time: number, ...args) =>
                        this.timer.interval.push(window.setInterval(callback, time, ...args))
                );
            } catch (error) {
                throw new PlayerError(
                    `数据转换错误`,
                    'vis.player.convertError',
                    {
                        primitive: primitive.name,
                        attribute: key,
                    },
                    error
                );
            }
        }
        return value;
    }

    protected createStrategy(): Record<DataBindingTypeEnum, IBindingStrategy> {
        const topicStrategy = (primitive: PrimitiveInstance, key: string) => {
            const binding = primitive.bindings[key] as IBindingTelemetry | IBindingTelepulse | IBindingTeleindication;
            if (
                binding.deviceId === '' ||
                (binding.type !== DataBindingTypeEnum.DEVICE_STATE && binding.topic === '')
            ) {
                throw new PlayerError(`未选择设备`, 'vis.player.unSelectDevice');
            }
            let topic = `${this.topicPre}dev/${binding.deviceSn}/${DataEngine.topicTypeMap[binding.type]}`;
            if (binding.type !== 'deviceState') {
                topic += `/${binding.topic}`;
            }
            if (!this.topicBindings.has(topic)) {
                this.topicBindings.set(topic, []);
            }
            this.topicBindings.get(topic)!.push({
                primitive: primitive,
                attr: key,
                ...binding,
            });
        };
        const controlStrategy = (enginEvent: DataEngineEvent, primitive: PrimitiveInstance, key: string) => {
            const binding = primitive.bindings[key];
            primitive.bindEvent(key, (event, target) => {
                this.dispatch(enginEvent, binding);
            });
        };
        const getBoardArgs = (keys: string[]) => {
            const value = {};
            keys.forEach(key => {
                value[key] = this.board.getBoardArg(key);
            });
            return value;
        };
        const getPrimitiveAttributes = (primitive: PrimitiveInstance, keys: string[]) => {
            const value = {};
            keys.forEach(key => {
                value[key] = primitive.getAttribute(key);
            });
            return value;
        };
        return {
            [DataBindingTypeEnum.TELEMETRY]: topicStrategy,
            [DataBindingTypeEnum.TELEINDICATION]: topicStrategy,
            [DataBindingTypeEnum.DEVICE_STATE]: topicStrategy,
            [DataBindingTypeEnum.TELEPULSE]: topicStrategy,
            [DataBindingTypeEnum.DEVICE_PROP]: topicStrategy,
            [DataBindingTypeEnum.TELECONTROL]: (primitive, key) =>
                controlStrategy(DataEngineEvent.TELECONTROL_TRIGGER, primitive, key),
            [DataBindingTypeEnum.TELEADJUST]: (primitive, key) =>
                controlStrategy(DataEngineEvent.TELEADJUST_TRIGGER, primitive, key),
            [DataBindingTypeEnum.PRIMITIVE_PROP]: (primitive, key) => {
                const binding = primitive.bindings[key] as IBindingPrimitiveProp,
                    targetPrimitive = this.board.getPrimitiveById(binding.primitiveId);
                if (!targetPrimitive) {
                    throw new PlayerError(`未找到绑定图元`, 'vis.player.notFoundBindingPrimitive');
                }
                const defaultValue = getPrimitiveAttributes(targetPrimitive, binding.primitiveProps);
                primitive.setAttribute(key, this.convertValue(defaultValue, binding.convertDefinition, primitive, key));
                binding.primitiveProps.forEach(value => {
                    targetPrimitive.on(value, () => {
                        primitive.setAttribute(
                            key,
                            this.convertValue(
                                getPrimitiveAttributes(targetPrimitive, binding.primitiveProps),
                                binding.convertDefinition,
                                primitive,
                                key
                            )
                        );
                    });
                });
            },
            [DataBindingTypeEnum.BOARD_ARGS]: (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingBoardArgs;
                const defaultValue = getBoardArgs(binding.args);
                primitive.setAttribute(key, this.convertValue(defaultValue, binding.convertDefinition, primitive, key));
                binding.args.forEach(value => {
                    this.board.on(value, () => {
                        primitive.setAttribute(
                            key,
                            this.convertValue(getBoardArgs(binding.args), binding.convertDefinition, primitive, key)
                        );
                    });
                });
            },
            [DataBindingTypeEnum.DEVICE_INFO]: async (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingDeviceInfo;
                const res = await this.configuration.getDevice(binding.deviceId);
                if (res) {
                    primitive.setAttribute(
                        key,
                        this.convertValue(res[binding.deviceInfo], binding.convertDefinition, primitive, key)
                    );
                } else {
                    throw new PlayerError(`未找到绑定设备`, 'vis.player.notFoundBindingDevice');
                }
            },
            [DataBindingTypeEnum.SCRIPT]: async (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingScript;
                const fun = () => {
                    return this.convertValue('', binding.eventAction, primitive, key);
                };
                if (binding.attrType === 'event') {
                    primitive.bindEvent(key, () => {
                        this.callWithAsyncErrorHandler({
                            fn: fun,
                            message: 'vis.player.bindingError',
                            params: {
                                primitive: primitive.name,
                                attribute: key,
                            },
                            primitive,
                        });
                    });
                } else {
                    primitive.setAttribute(
                        key,
                        (await this.callWithErrorHandler({
                            fn: fun,
                            message: '脚本配置错误',
                            template: 'vis.player.actionBindingError',
                        })) as IBindingValue
                    );
                }
            },
            [DataBindingTypeEnum.DIALOG]: (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingDialog;
                primitive.bindEvent(key, (event, target) => {
                    this.dispatch(DataEngineEvent.DIALOG_TRIGGER, binding, primitive);
                });
            },
            [DataBindingTypeEnum.POPOVER]: (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingPopover;
                primitive.bindEvent(key, (event, target) => {
                    this.dispatch(DataEngineEvent.POPOVER_TRIGGER, binding, primitive, event, target);
                });
            },
            [DataBindingTypeEnum.LINK_TO]: (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingLinkTo;
                primitive.bindEvent(key, async (event, target) => {
                    await this.callWithAsyncErrorHandler({
                        fn: () => {
                            if (binding.blank) {
                                window.open(binding.url);
                            } else {
                                window.open(binding.url, '_self');
                            }
                        },
                        message: `vis.player.bindingError`,
                        params: {
                            primitive: primitive.name,
                            attribute: key,
                        },
                        primitive,
                    });
                });
            },
            [DataBindingTypeEnum.BOARD_TOGGLE]: (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingBoardToggle;
                primitive.bindEvent(key, (event, target) => {
                    this.dispatch(DataEngineEvent.BOARD_TOGGLE_TRIGGER, binding);
                });
            },
            [DataBindingTypeEnum.LINT_TO_CONFIGURATION]: (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingLinkToConfiguration;
                primitive.bindEvent(key, (event, target) => {
                    this.dispatch(DataEngineEvent.LINK_TO_CONFIGURATION_TRIGGER, binding);
                });
            },
            [DataBindingTypeEnum.CUSTOM_SUBSCRIPTION]: async (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingCustomSubscribe;
                const customSubscription = this.customBindings?.subscriptions?.[binding.customKey];
                if (customSubscription) {
                    if (customSubscription.needSelectDevice && (binding.deviceId === '' || binding.deviceSn === '')) {
                        throw new PlayerError(`未选择设备`, 'vis.player.unSelectDevice');
                    }
                    let topic;
                    if (typeof customSubscription.topic === 'string') {
                        topic = customSubscription.topic;
                    } else if (typeof customSubscription.topic === 'function') {
                        await this.callWithErrorHandler({
                            fn: async () => {
                                topic = await (
                                    customSubscription.topic as (...args: unknown[]) => string | Promise<string>
                                )({
                                    id: binding.deviceId,
                                    sn: binding.deviceSn,
                                });
                            },
                            message: '自定义绑定配置错误',
                            template: 'vis.player.customBindingConfigError',
                        });
                    }
                    if (!topic) {
                        throw new PlayerError(`自定义绑定配置错误`, 'vis.player.customBindingConfigError');
                    }
                    if (!this.topicBindings.has(topic)) {
                        this.topicBindings.set(topic, []);
                    }
                    this.topicBindings.get(topic)!.push({
                        primitive: primitive,
                        attr: key,
                        customFormatter: customSubscription.formatter,
                        ...binding,
                    });
                    await this.callWithErrorHandler({
                        fn: async () => {
                            primitive.attributes[key] = await customSubscription.getInitialValue({
                                id: binding.deviceId,
                                sn: binding.deviceSn,
                            });
                        },
                        message: '获取自定义绑定初始值错误',
                        template: 'vis.player.getCustomSubscriptionInitialValueFailed',
                    });
                } else {
                    throw new PlayerError(`未找到自定义绑定配置`, 'vis.player.notFoundCustomBinding');
                }
            },
            [DataBindingTypeEnum.CUSTOM_DATA]: async (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingCustomData;
                const customData = this.customBindings?.data?.[binding.customKey];
                if (customData) {
                    const fn = async () => {
                        const result = await customData.get({id: binding.deviceId, sn: binding.deviceSn});
                        primitive.setAttribute(
                            key,
                            this.convertValue(result, binding.convertDefinition, primitive, key)
                        );
                    };
                    await this.callWithErrorHandler({
                        fn,
                        message: '自定义绑定配置错误',
                        template: 'vis.player.customBindingConfigError',
                    });
                    if (customData.needLoop) {
                        this.timer.interval.push(window.setInterval(fn, Math.max(customData.loopInterval ?? 0, 500)));
                    }
                } else {
                    throw new PlayerError(`未找到自定义绑定配置`, 'vis.player.notFoundCustomBinding');
                }
            },
            [DataBindingTypeEnum.CUSTOM_ACTION]: (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingCustomAction;
                const customAction = this.customBindings?.actions?.[binding.customKey];
                if (customAction) {
                    primitive.bindEvent(key, async (event, target) => {
                        await this.callWithAsyncErrorHandler({
                            fn: () => {
                                customAction.action({
                                    device: {id: binding.deviceId, sn: binding.deviceSn},
                                    primitive: {
                                        getAttr: primitive.getAttribute.bind(primitive),
                                        setAttr: primitive.setAttribute.bind(primitive),
                                    },
                                    board: {
                                        getAttr: this.board.getBoardArg.bind(this.board),
                                        setAttr: this.board.setBoardArg.bind(this.board),
                                    },
                                });
                            },
                            message: 'vis.player.customBindingConfigErrorWithPrimitive',
                            params: {primitive: primitive.name, attribute: key},
                            primitive,
                        });
                    });
                } else {
                    throw new PlayerError(`未找到自定义绑定配置`, 'vis.player.notFoundCustomBinding');
                }
            },
            [DataBindingTypeEnum.CUSTOM_COMPONENT]: (primitive: PrimitiveInstance, key: string) => {
                const binding = primitive.bindings[key] as IBindingCustomComponent;
                const customComponent = this.customBindings?.components?.[binding.customKey];
                if (customComponent) {
                    primitive.bindEvent(key, (event: Event, target: HTMLElement) => {
                        event.stopPropagation();
                        this.dispatch(DataEngineEvent.CUSTOM_COMPONENT_TRIGGER, {
                            component: customComponent.component,
                            componentProps: customComponent.componentProps,
                            params: {
                                device: {
                                    id: binding.deviceId,
                                    sn: binding.deviceSn,
                                },
                                primitive: {
                                    getAttr: primitive.getAttribute.bind(primitive),
                                    setAttr: primitive.setAttribute.bind(primitive),
                                },
                                board: {
                                    getAttr: this.board.getBoardArg.bind(this.board),
                                    setAttr: this.board.setBoardArg.bind(this.board),
                                },
                            },
                            target,
                        });
                    });
                } else {
                    throw new PlayerError(`未找到自定义绑定配置`, 'vis.player.notFoundCustomBinding');
                }
            },
        };
    }

    async parse() {
        const primitives = this.board.primitives;
        primitives.forEach(primitive => {
            Object.keys(primitive.bindings).forEach(async key => {
                const bindingType = primitive.bindings[key].type as DataBindingTypeEnum;
                if (Reflect.has(this.bindingStrategies, bindingType)) {
                    await this.callWithAsyncErrorHandler({
                        fn: async () => await this.bindingStrategies[bindingType](primitive, key),
                        message: 'vis.player.bindingError',
                        params: {
                            primitive: primitive.name,
                            attribute: key,
                        },
                        primitive,
                    });
                }
            });
        });

        await this.getSubscriptionInitialValue();

        await this.subscribeTopics();
    }

    async getSubscriptionInitialValue() {
        const deviceBindingList: IDeviceBindingList = {};
        const basicFormat = binding => {
            const deviceList = deviceBindingList[binding.type] ?? (deviceBindingList[binding.type] = {});
            const _binding = binding as IBindingTelemetry | IBindingTelepulse | IBindingTeleindication;
            const topicList = deviceList[_binding.deviceSn] ?? (deviceList[_binding.deviceSn] = {});
            const bindingList = topicList[_binding.topic] ?? (topicList[_binding.topic] = []);
            bindingList.push(binding);
        };
        const deviceFormat = binding => {
            const deviceList = deviceBindingList[binding.type] ?? (deviceBindingList[binding.type] = {});
            const bindingList = deviceList[binding.deviceSn] ?? (deviceList[binding.deviceSn] = []);
            bindingList.push(binding);
        };
        const basicRequestHandler = (
            request: (queryList: Record<string, string[]>) => Promise<Response<Record<string, Record<string, unknown>>>>
        ) => {
            return (queryDeviceList: string[], type: keyof IDeviceBindingList) => {
                const queryList = {};
                queryDeviceList.forEach(key => {
                    queryList[key] = Object.keys(deviceBindingList[type]![key]);
                });
                return request(queryList).then(result => {
                    if (result.state) {
                        Object.keys(result.data).forEach(sn => {
                            Object.keys(result.data[sn]).forEach(topic => {
                                const bindings = deviceBindingList[type]![sn][topic];
                                bindings.forEach(binding => {
                                    binding.primitive.setAttribute(
                                        binding.attr,
                                        this.convertValue(
                                            result.data[sn][topic],
                                            binding.convertDefinition,
                                            binding.primitive,
                                            binding.attr
                                        )
                                    );
                                });
                            });
                        });
                    } else {
                        throw new PlayerError('查询订阅初始值失败', 'vis.player.getSubscriptionInitialValueFailed');
                    }
                });
            };
        };
        const deviceRequestHandler = (request: (queryList: string[]) => Promise<Response<Record<string, boolean>>>) => {
            return (queryDeviceList: string[], type: keyof IDeviceBindingList) => {
                return request(queryDeviceList).then(result => {
                    if (result.state) {
                        Object.keys(result.data).forEach(sn => {
                            const bindings = deviceBindingList[DataBindingTypeEnum.DEVICE_STATE]![sn];
                            bindings.forEach(binding => {
                                binding.primitive.setAttribute(
                                    binding.attr,
                                    this.convertValue(
                                        result.data[sn],
                                        binding.convertDefinition,
                                        binding.primitive,
                                        binding.attr
                                    )
                                );
                            });
                        });
                    } else {
                        throw new PlayerError('查询订阅初始值失败', 'vis.player.getSubscriptionInitialValueFailed');
                    }
                });
            };
        };
        const subscriptionValueMethod = {
            [DataBindingTypeEnum.TELEMETRY]: {
                format: basicFormat,
                request: basicRequestHandler(DeviceApi.getTelemetryValue),
            },
            [DataBindingTypeEnum.TELEINDICATION]: {
                format: basicFormat,
                request: basicRequestHandler(DeviceApi.getTeleindicationValue),
            },
            [DataBindingTypeEnum.TELEPULSE]: {
                format: basicFormat,
                request: basicRequestHandler(DeviceApi.getTelepulseValue),
            },
            [DataBindingTypeEnum.DEVICE_STATE]: {
                format: deviceFormat,
                request: deviceRequestHandler(DeviceApi.getDeviceStateValue),
            },
            [DataBindingTypeEnum.DEVICE_PROP]: {
                format: basicFormat,
                request: basicRequestHandler(DeviceApi.getDevicePropertyValue),
            },
        };

        this.topicBindings.forEach(item => {
            item.forEach(binding => {
                subscriptionValueMethod[binding.type]?.format(binding);
            });
        });

        const promises: Promise<{type: DataBindingTypeEnum; result: Response<unknown>}>[] = [];
        Object.keys(deviceBindingList).forEach(type => {
            const deviceList = deviceBindingList[type];
            const keys = Object.keys(deviceList);
            for (let i = 0; i * 300 < keys.length; i++) {
                promises.push(subscriptionValueMethod[type].request(keys.slice(i * 300, (i + 1) * 300), type));
            }
        });

        return Promise.all(promises).catch(e => {
            this.dispatch(DataEngineEvent.ERROR, {message: 'vis.player.getSubscriptionInitialValueFailed', error: e});
        });
    }

    async subscribeTopics() {
        if (this.topicBindings.size === 0) return;
        const topics = Array.from(this.topicBindings.keys());

        try {
            const authFailedTopics = await this.mqttClient.subscribe(topics);
            if (authFailedTopics.length > 0) {
                authFailedTopics.forEach(topic => {
                    this.topicBindings.get(topic)!.forEach(item => {
                        item.primitive.hasBindingError = true;
                    });
                });
                this.dispatch(DataEngineEvent.ERROR, {message: 'vis.player.partiallyFailedToSubscribe'});
            }
        } catch (e) {
            switch ((e as Error).message) {
                case MqttClientError.DISCONNECTED:
                    this.dispatch(DataEngineEvent.ERROR, {message: 'vis.player.mqttDisconnect'});
                    break;
                case MqttClientError.TOPICS_AUTH_FAILED:
                    this.dispatch(DataEngineEvent.ERROR, {message: 'vis.player.mqttTopicsAuthFailed'});
                    break;
                case MqttClientError.SUBSCRIBE_FAILED:
                    this.dispatch(DataEngineEvent.ERROR, {message: 'vis.player.mqttSubscribeFailed'});
                    break;
            }
        }

        this.mqttClient.on(MqttClientEvent.MESSAGE, (topic: string, payload: string) => {
            let dataValue;
            if (this.topicBindings.has(topic)) {
                this.topicBindings.get(topic)!.forEach((item: ITopicBinding) => {
                    const primitive = item.primitive;
                    this.callWithAsyncErrorHandler({
                        fn: () => {
                            if (typeof dataValue === 'undefined') {
                                // 自定义订阅提供格式化方法处理自定义的数据
                                if (item.type === 'customSubscription') {
                                    dataValue = !item.customFormatter ? item.customFormatter!(payload) : payload;
                                } else {
                                    dataValue = DataEngine.getTopicValue[item.type](payload);
                                }
                            }
                            const value = this.convertValue(dataValue, item.convertDefinition, primitive, item.attr);
                            // 更新图元属性
                            primitive.setAttribute(item.attr, value);
                        },
                        message: 'vis.player.bindingError',
                        primitive,
                        params: {primitive: primitive.name, attribute: item.attr},
                    });
                });
            }
        });
    }

    protected async callWithErrorHandler({
        fn,
        message,
        template,
        params,
    }: {
        fn: () => Promise<IBindingValue | void>;
        message: string;
        template: string;
        params?: Record<string, string | number>;
    }) {
        try {
            return await fn();
        } catch (error) {
            console.error(message, error);
            throw new PlayerError(message, template, params, error);
        }
    }

    protected async callWithAsyncErrorHandler({
        fn,
        message,
        params,
        primitive,
    }: {
        fn: (...args: any) => any;
        message: string;
        primitive: PrimitiveInstance;
        params?: Record<string, unknown>;
    }) {
        try {
            return await fn();
        } catch (error) {
            primitive.hasBindingError = true;
            console.error(message, error);
            this.dispatch(DataEngineEvent.ERROR, {message, params, error});
        }
    }
}
