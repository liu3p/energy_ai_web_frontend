import {BarOption} from '../type';

const option: BarOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow',
            shadowStyle: {
                color: 'rgba(49,98,225,0.1)',
            },
        },
    },
    legend: {
        data: [],
        icon: 'roundRect',
        left: 16,
    },
    color: ['#3162E1', '#62D8A9'],
    grid: {
        left: '3%',
        right: '3%',
        top: '10%',
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
    dataZoom: [
        {
            type: 'inside',
            start: 0,
            end: 100,
            minValueSpan: 1,
        },
    ],
    series: [
        {
            name: '',
            data: [],
            type: 'bar',
        },
    ],
};

export default option;
