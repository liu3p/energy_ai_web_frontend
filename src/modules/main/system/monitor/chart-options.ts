import {LineOption} from '@/common/echarts/type';

export const initOptions = (options?: {
    color?: string;
    xAxis?: (string | number)[];
    data?: (string | number)[];
}): LineOption & {
    xAxis: echarts.XAXisComponentOption & {data: Array<number | string | null>};
    series: echarts.LineSeriesOption[];
} => {
    const {
        color = '#1DA500',
        xAxis = [],
        data = [],
    } = options || {};
    return {
        color: [color],
        tooltip: {
            show: false
        },
        grid: {
            left: '20px',
            right: '24px',
            top: '20px',
            bottom: '8px',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: '#000000',
                    type: 'dashed',
                    opacity: 0.2,
                },
            },
            axisLabel: {
                show: true,
                color: 'rgba(0,0,0,0.6)',
            },
            data: xAxis ?? [],
        },
        yAxis: [
            {
                name: '',
                type: 'value',
                axisLabel: {
                    show: true,
                    color: '#00000099',
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        color: 'rgba(0,0,0,0.2)',
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
                name: 'Soc',
                type: 'line',
                lineStyle: {
                    width: 2,
                },
                symbol: 'circle',
                symbolSize: 6,
                showSymbol: false,
                smooth: false,
                data: data ?? [],
                areaStyle: {
                    color: '#1DA5000A',
                },
            },
        ],
    };
};