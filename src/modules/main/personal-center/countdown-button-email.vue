<template>
    <cv-button type="primary" :disabled="hasSend || props.disabledRule" @click="sendCode">
        {{ hasSend ? timerNum : t('fw.common.sendCode') }}
    </cv-button>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, ref, watch} from 'vue';
import {useLocale} from 'cloudview.ui-next';

const props = defineProps({
    disabledRule: {
        type: Boolean,
        required: false,
        default: false,
    },
    isReset: {
        type: Boolean,
        required: false,
        default: false,
    },
});
const {t} = useLocale();
const currentTs = Date.now();
const sendTs = ref(Number(localStorage.getItem('sendTs')));
const hasSend = ref(sendTs.value === 0 ? false : true);
const timerNum = ref(120);
let timer: undefined | number = undefined;
const emit = defineEmits(['sent', 'clear']);

if (hasSend.value) {
    if (120 - Math.round((currentTs - sendTs.value) / 1000) >= 0) {
        timerNum.value = 120 - Math.round((currentTs - sendTs.value) / 1000);
        timer = window.setInterval(() => {
            timerNum.value--;
            if (timerNum.value <= 0) {
                emit('clear');
                clearTimer();
            }
        }, 1000);
    } else {
        emit('clear');
        clearTimer();
    }
}

function sendCode() {
    hasSend.value = true;
    localStorage.setItem('sendTs', String(Date.now()));
    setTimeout(() => {
        if (Date.now() - Number(localStorage.getItem('sendTs')) >= 120000) {
            localStorage.removeItem('sendTs');
        }
    }, 120000);
    timerNum.value = 120;
    emit('sent');
    timer = window.setInterval(() => {
        timerNum.value--;
        if (timerNum.value <= 0) {
            emit('clear');
            clearTimer();
        }
    }, 1000);
}

function clearTimer() {
    clearInterval(timer);
    timer = undefined;
    timerNum.value = 120;
    hasSend.value = false;
}

watch(
    () => props.isReset,
    (newValue, oldValue) => {
        if (newValue) {
            clearTimer();
        }
    }
);

onBeforeUnmount(() => {
    clearTimer();
});
</script>
