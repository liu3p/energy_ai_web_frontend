<template>
    <div class="vis-board-tab">
        <div
            v-for="(item, index) in boards"
            :key="item.boardId"
            class="vis-board-tab__item"
            :class="{'is-active': activeBoard === item}"
            @click="activeBoardChange(item)"
        >
            <span class="vis-board-tab__name">
                <cv-tooltip :content="item.boardName" :show-after="1500">
                    {{ item.boardName }}
                </cv-tooltip>
            </span>
            <div class="vis-board-tab__ops">
                <cv-tooltip :content="t('vis.common.edit')">
                    <cv-icon :size="14" @click.stop="editBoardName(item)">
                        <cv-icon-edit></cv-icon-edit>
                    </cv-icon>
                </cv-tooltip>
                <cv-tooltip :content="t('vis.common.copy')">
                    <cv-icon :size="14" @click.stop="copyBoard(item)">
                        <cv-icon-copy></cv-icon-copy>
                    </cv-icon>
                </cv-tooltip>
                <cv-tooltip :content="t('vis.common.delete')">
                    <cv-icon :size="14" @click.stop="deleteBoard(item, index)">
                        <cv-icon-del></cv-icon-del>
                    </cv-icon>
                </cv-tooltip>
            </div>
        </div>
        <div class="vis-board-tab__add-op">
            <cv-button type="primary" text @click="addBoard">{{ t('vis.configuration.addBoard') }}</cv-button>
        </div>
    </div>
    <board-dialog ref="dialog" v-model:form="formData" :title="title" :rules="rules" :submit="submit"></board-dialog>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {computed, ref, watch} from 'vue';
import {CvIconEdit} from 'cloudview.ui-next-icon';
import {
    Board,
    type IBoard,
    IdUtils,
    provideObserver,
    StringUtils,
    Topics,
} from '@cloudview.visualization-next/services';
import BoardDialog from './board-dialog.comp.vue';

const observer = provideObserver();
const {t} = useLocale();

defineOptions({name: 'BoardTab'});

interface IProps {
    boards?: Board[];
}

const props = withDefaults(defineProps<IProps>(), {
    boards() {
        return [];
    },
});

const emits = defineEmits(['update:boards']);

const boards = computed<Board[]>({
    get() {
        return props.boards;
    },
    set(val) {
        emits('update:boards', val);
    },
});

const activeBoard = ref<Board>();
watch(boards, () => {
    if (boards.value.length > 0 && !activeBoard.value) {
        activeBoard.value = boards.value[0];
    }
});

const activeBoardChange = board => {
    activeBoard.value = board;
};

watch(
    activeBoard,
    board => {
        if (board) {
            observer.dispatch(Topics.ACTIVE_BOARD_CHANGED, board);
        }
    },
    {immediate: true}
);

const boardNameSet = computed(() => {
    const res = new Set();
    boards.value.forEach(board => {
        res.add(board.boardName);
    });
    return res;
});

const formData = ref();
const dialog = ref();
const title = ref('');
let type = '';
let boardNameIndex = 1;

const editBoardName = (board: Board) => {
    formData.value = JSON.parse(JSON.stringify(board.getConfig()));
    dialog.value.open();
    title.value = t('vis.configuration.editBoardName');
    type = 'edit';
};

const getBoardDefaultName = () => {
    while (boardNameSet.value.has(t('vis.common.board') + boardNameIndex)) {
        boardNameIndex++;
    }
    return t('vis.common.board') + boardNameIndex;
};

const copyBoard = (board: Board) => {
    title.value = t('vis.configuration.copyBoard');
    formData.value = JSON.parse(JSON.stringify(board.getConfig()));
    formData.value.boardId = IdUtils.genBoardId();

    formData.value.boardName = getBoardDefaultName();
    dialog.value.open();
    type = 'copy';
};

const deleteBoard = async (board: Board, index: number) => {
    try {
        await CvMessageBox.confirm(
            t('vis.configuration.deleteBoardMassage', {0: board.boardName}),
            t('vis.common.prompt'),
            {
                type: 'info',
            }
        );
        if (boards.value.length === 1) {
            await CvMessageBox.alert(t('vis.configuration.onlyOneBoardMassage'), t('vis.common.prompt'));
            return;
        }
        if (board === activeBoard.value) {
            if (index > 0) {
                activeBoard.value = boards.value[index - 1];
            } else {
                activeBoard.value = boards.value[index + 1];
            }
        }
        boards.value.splice(index, 1);
        observer.dispatch(Topics.EDITED, true);
    } catch (e) {
        console.error(e);
    }
};

const addBoard = () => {
    title.value = t('vis.configuration.addBoard');
    const rect = activeBoard.value!.svgInstance!.node.getBoundingClientRect();
    formData.value = {
        boardName: getBoardDefaultName(),
        attributes: {viewBox: {x: 0, y: 0, width: rect.width, height: rect.height}},
    };
    dialog.value.open();
    type = 'add';
};

const rules = {
    boardName: [
        {
            required: true,
            message: t('vis.configuration.message.boardNameRequired'),
        },
        {
            validator(rule, val, cb) {
                if (val.trim() === '') {
                    return cb(t('vis.common.canNotOnlySpace'));
                }
                if (StringUtils.isEmpty(formData.value.boardId)) {
                    if (
                        boards.value.some(board => {
                            return board.boardName === val;
                        })
                    ) {
                        return cb(t('vis.configuration.message.boardNameDuplicated'));
                    }
                } else {
                    if (
                        boards.value.some(board => {
                            return board.boardName === val && board.boardId !== formData.value.boardId;
                        })
                    ) {
                        return cb(t('vis.configuration.message.boardNameDuplicated'));
                    }
                }
                return cb();
            },
            trigger: 'blur',
        },
    ],
};

const submit = formModel => {
    if (type === 'edit') {
        boards.value.some(board => {
            if (board.boardId === formModel.boardId) {
                board.boardName = formModel.boardName;
                return true;
            }
        });
    } else if (type === 'add' || type === 'copy') {
        const board = new Board(formModel as IBoard);
        boards.value.push(board);
        activeBoard.value = board;
    }
    observer.dispatch(Topics.EDITED, true);
    return true;
};
</script>
