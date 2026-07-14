import {LineOption} from '../type';

const option: LineOption = {
    tooltip: {
        trigger: 'axis',
        textStyle: {
            color: '#35353E',
            fontSize: 12,
        },
        axisPointer: {
            type: 'line',
            lineStyle: {
                type: 'solid',
                color: '#D6E0F9',
            },
        },
        confine: true,
    },
    legend: {
        data: [],
        icon: 'roundRect',
        left: 16,
    },
    color: ['#3162E1', '#1DA500'],
    grid: {
        left: '3%',
        right: '3%',
        top: '10%',
        bottom: '4%',
        containLabel: true,
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
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
    yAxis: [
        {
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
    ],
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
            type: 'line',
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 0,
                            color: 'rgba(49, 98, 225, 0.40)',
                        },
                        {
                            offset: 1,
                            color: 'rgba(49, 98, 225, 0.01)',
                        },
                    ],
                    global: false,
                },
            },
            lineStyle: {
                width: 3,
            },
            symbol: 'circle',
            symbolSize: 10,
            showSymbol: false,
            smooth: true,
            data: [],
        },
    ],
};

export default option;
