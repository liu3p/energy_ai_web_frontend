<template>
    <div ref="player" class="vis-player">
        <div v-if="navigations.length > 1" class="vis-player__navigation">
            <div
                v-for="(item, index) in navigations"
                :key="index"
                class="vis-player__navigation-item"
                @click="navigateConfiguration(item)"
            >
                {{ names[item] || '' }}
                <span v-if="index + 1 !== navigations.length" class="vis-player__navigation-icon">></span>
            </div>
        </div>
        <div class="vis-player__main">
            <div class="vis-player__main-core" :style="playerStyle">
                <vis-player-configuration
                    v-for="(item, index) in navigations"
                    v-show="currIndex === index"
                    :key="index"
                    :ref="el => (playerConfiguration[index] = el)"
                    :vis-id="item"
                    :show-board-tab="props.showBoardTab"
                    :navigate-configuration="navigateConfiguration"
                    @send-name="sendName"
                    @send-configuration="(...args) => index === 0 && emit('sendConfiguration', ...args)"
                ></vis-player-configuration>

                <!-- 工具按钮组 -->
                <div
                    v-if="props.showToolButton"
                    class="vis-player__tools-button"
                    @click="isShowTools = isShowTools > 0 ? 0 : 1"
                >
                    <cv-icon color="white">
                        <cv-icon-more></cv-icon-more>
                    </cv-icon>
                    <ul
                        v-show="isShowTools > 0"
                        ref="toolList"
                        class="vis-player__tools-list"
                        :class="{'vis-player__tools-list--active': isShowTools > 0}"
                    >
                        <li
                            class="vis-player__tool-button"
                            :class="{'vis-player__tool-button--is-loading': toolsLoading.screenShotSvg}"
                            @click="toolHandler('screenShotSvg', $event)"
                        >
                            <div class="vis-player__tool-button-wrap">
                                <cv-tooltip :content="t('vis.player.saveToSvg')" placement="top">
                                    <cv-icon color="white">
                                        <cv-icon-screenshot-svg></cv-icon-screenshot-svg>
                                    </cv-icon>
                                </cv-tooltip>
                            </div>
                        </li>
                        <li
                            class="vis-player__tool-button"
                            :class="{'vis-player__tool-button--is-loading': toolsLoading.screenShotPng}"
                            @click="toolHandler('screenShotPng', $event)"
                        >
                            <div class="vis-player__tool-button-wrap">
                                <cv-tooltip :content="t('vis.player.saveToPng')" placement="top">
                                    <cv-icon color="white">
                                        <cv-icon-screenshot-png></cv-icon-screenshot-png>
                                    </cv-icon>
                                </cv-tooltip>
                            </div>
                        </li>
                        <li class="vis-player__tool-button" @click="toolHandler('fullScreen', $event)">
                            <div class="vis-player__tool-button-wrap">
                                <cv-tooltip
                                    :content="isFullScreen ? t('vis.common.escScreenFull') : t('vis.common.screenFull')"
                                    placement="top"
                                >
                                    <cv-icon color="white">
                                        <cv-icon-fullscreen v-if="!isFullScreen"></cv-icon-fullscreen>
                                        <cv-icon-esc-fullscreen v-if="isFullScreen"></cv-icon-esc-fullscreen>
                                    </cv-icon>
                                </cv-tooltip>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, reactive, ref} from 'vue';
// @ts-ignore
import VisPlayerConfiguration from './player-configuration.vue';
import {useLocale} from 'cloudview.ui-next';
import {Utils} from '@cloudview.visualization-next/services';
import {CvIconEscFullscreen, CvIconFullscreen, CvIconMore} from 'cloudview.ui-next-icon';

defineOptions({name: 'VisPlayer'});
const emit = defineEmits(['sendConfiguration']);
const props = defineProps({
    visId: {
        type: String,
        required: true,
    },
    showBoardTab: {
        type: Boolean,
        default: true,
    },
    showToolButton: {
        type: Boolean,
        default: true,
    },
});

const {t} = useLocale();
const navigations = ref([props.visId]);
const names = ref({});
const currIndex = ref(0);
const playerConfiguration = ref<VisPlayerConfiguration[]>([]);
const playerStyle = ref<object>({});

const navigateConfiguration = (id: string) => {
    const navigationIndex = navigations.value.indexOf(id);
    if (navigationIndex === -1) {
        navigations.value.push(id);
    } else {
        navigations.value = navigations.value.slice(0, navigationIndex + 1);
    }
    currIndex.value = navigations.value.length - 1;
};

const sendName = data => {
    names.value[data.id] = data.name;
};

// 全屏
const isFullScreen = ref(false);
const {isSupport, prefix} = Utils.fullscreenSupport();
const fullscreenEventName = prefix + 'fullscreenchange';
const fullScreen = () => {
    if (!isSupport) {
        CvMessage(t('vis.common.fullScreenMassage'));
        return;
    }
    let methodName;
    if (isFullScreen.value) {
        methodName = prefix === '' ? 'exitFullscreen' : `${prefix}ExitFullscreen`;
        document[methodName]();
    } else {
        methodName = prefix === '' ? 'requestFullscreen' : `${prefix}RequestFullscreen`;
        playerStyle.value = {position: 'fixed', top: '0', left: '0', zIndex: '100'};
        document.body[methodName]();
    }
};
const exitFullscreen = () => {
    isFullScreen.value = !isFullScreen.value;
    if (isFullScreen.value === false) {
        playerStyle.value = {position: 'static'};
    }
};
onMounted(() => {
    //监听退出全屏事件
    if (isSupport) {
        document.addEventListener(fullscreenEventName, exitFullscreen);
    }
});
onBeforeUnmount(() => {
    document.removeEventListener(fullscreenEventName, exitFullscreen);
});

// 截屏
const screenShot = async (type = 'png') => {
    const svg = playerConfiguration.value[currIndex.value].getStageSvg();
    let data: string | Blob;
    if (type === 'svg') {
        data = 'data:image/svg+xml;utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    } else {
        const [error, canvas] = await Utils.screenShotSvg(svg);
        if (error) {
            CvMessage({
                type: 'error',
                message: t('vis.common.failedScreenShots'),
            });
            return false;
        }
        data = canvas!.toDataURL();
    }
    Utils.download(data, `${names.value[navigations.value[currIndex.value]]}.${type}`);
};

// 工具栏
const isShowTools = ref(0);
const toolList = ref();
const toolActions = {
    screenShotPng: () => screenShot('png'),
    screenShotSvg: () => screenShot('svg'),
    fullScreen: fullScreen,
};
const toolsLoading = reactive<Record<keyof typeof toolActions, boolean>>({
    screenShotSvg: false,
    screenShotPng: false,
    fullScreen: false,
});
const toolHandler = async (action: keyof typeof toolActions, event: MouseEvent) => {
    event.stopPropagation();
    isShowTools.value++;
    if (toolsLoading[action]) return;
    toolsLoading[action] = true;
    await toolActions[action]();
    toolsLoading[action] = false;
    if (isShowTools.value === 2) {
        isShowTools.value = 0;
    } else {
        isShowTools.value--;
    }
};
onMounted(() => {
    if (props.showToolButton) {
        Array.from(toolList.value.children)
            .reverse()
            .forEach((item, index) => {
                (item as HTMLElement).style.animationDelay = index * 0.1 + 's';
            });
    }
});
</script>
