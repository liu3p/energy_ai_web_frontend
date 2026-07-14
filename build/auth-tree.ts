import {writeFile} from 'fs/promises';

const arr = {
    'overview_1&1,2,5,6': '总览',

    manage_2: '管理',

    'channelManage_2_1&1,2,3,4': '渠道管理',
    'customerManage_2_2&1,2,3,4': '客户管理',
    'siteManage_2_3&1,2,3,4,5,7,8': '电站管理',
    'accountManage_2_4&1,2,3,4,9,10,11': '账号管理',
    'roleManage_2_5&1': '角色管理',
};

const internationalArr = [
    'overview',
    //
    'manage',
    'channelManage',
    'siteManage',
    'accountManage',
    'customerManage',
    'roleManage',
];
const o = {
    query: '查询', // 1
    add: '新增', // 2
    edit: '编辑', // 3
    delete: '删除', // 4
    control: '控制', // 5
    topUp: '置顶', // 6
    buildSite: '快速建站', // 7
    removeSite: '强删建站', // 8
    resetPwd: '重置密码', // 9
    email: '修改邮箱', // 10
    startStopAccount: '启停', // 11
};

interface Operation {
    id: string;
    label: string;
    name: string;
}

const ooo: Operation[] = [];
Object.entries(o).forEach(([key, value]) => {
    ooo.push({
        id: key,
        label: 'auth.' + key,
        name: value,
    });
});

function init() {
    const res: any = [];
    const internationalRes: any = [];
    Object.entries(arr).forEach(([key, value]) => {
        const [menu, op] = key.split('&');
        const [id, key1, key2] = menu.split('_');
        const opA = op
            ? op
                  .split(',')
                  .filter(item => item !== '1')
                  .map(item => ({...ooo[Number(item) - 1], id: id + '_' + ooo[Number(item) - 1].id}))
            : [];
        if (key1 && !key2) {
            res[Number(key1) - 1] = {
                id,
                label: 'auth.' + id,
                name: value,
                children: opA.slice(0),
            };
            internationalArr.includes(id) &&
                (internationalRes[Number(key1) - 1] = {
                    id,
                    label: 'auth.' + id,
                    name: value,
                    children: opA.slice(0),
                });
        } else if (key1 && key2) {
            res[Number(key1) - 1].children[Number(key2) - 1] = {
                id,
                label: 'auth.' + id,
                name: value,
                children: opA.slice(0),
            };
            internationalArr.includes(id) &&
                (internationalRes[Number(key1) - 1].children[Number(key2) - 1] = {
                    id,
                    label: 'auth.' + id,
                    name: value,
                    children: opA.slice(0),
                });
        }
    });
    const doneRes: any[] = [];
    internationalRes.forEach(item => {
        if (item) {
            item.children = item.children.filter(c => c);
            doneRes.push(item);
        }
    });
    writeFile('auth-international.json', JSON.stringify(doneRes), 'utf-8');
    writeFile('auth.json', JSON.stringify(res), 'utf-8');
}

init();
