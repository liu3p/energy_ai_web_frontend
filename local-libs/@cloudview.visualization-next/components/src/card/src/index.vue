<template>
    <component :is="compMap[props.type]" ref="card" v-bind="$props" v-on="$attrs"> </component>
</template>
<script lang="ts" setup>
import defaultProps from './props';
import CardComp from './card.comp.vue';
import CardMini from './card-mini.comp.vue';
import CardSmall from './card-small.comp.vue';
import {ref} from 'vue';

const compMap = {
    default: CardComp,
    small: CardSmall,
    mini: CardMini,
};

defineOptions({name: 'Card'});
const props = defineProps(defaultProps);
const card = ref();

defineExpose({card});
</script>
