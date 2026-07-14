import {CustomOption} from '../type';

const option: CustomOption = {
    legend: {
        data: [],
        icon: 'roundRect',
        left: 16,
    },
    color: ['#3162E1', '#62D8A9'],
    grid: {
        left: '3%',
        right: '3%',
        top: '13%',
        bottom: '4%',
        containLabel: true,
    },
    xAxis: {
        type: 'category',
        axisLine: {
            lineStyle: {
                color: '#D6E0F9',
                type: 'dashed',
            },
        },
        axisLabel: {
            show: true,
            color: '#35353E',
            margin: 10,
        },
        axisPointer: {
            show: true,
            label: {
                show: true,
                color: '#3162E1',
                fontWeight: 'bold',
                backgroundColor: '#FFFFFF',
            },
        },
        axisTick: {
            show: false,
        },
        data: [],
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            show: true,
            color: '#35353E',
        },
        splitLine: {
            show: true,
            lineStyle: {
                type: 'dashed',
                color: '#D6E0F9',
            },
        },
    },
    series: [
        {
            name: '',
            data: [],
            type: 'custom',
            renderItem: function (params, api) {
                return {
                    type: 'rect',
                };
            },
        },
    ],
};

export default option;
