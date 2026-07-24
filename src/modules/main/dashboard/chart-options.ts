import { LineOption } from '@/common/echarts/type';
type chartParams = { xAxis: (number | string)[]; data: { name: string; type: 'line' | 'bar'; color: string; data: (number | string)[] }[] };
export const initOptions = (options?: chartParams): LineOption & {
    xAxis: echarts.XAXisComponentOption & { data: Array<number | string | null> };
    series: echarts.SeriesOption[];
} => {
    const propsData = options ?? {
        xAxis: [],
        data: []
    };
    const legendData: any = [];
    const colorList: string[] = [];
    const series: echarts.SeriesOption[] = propsData.data.map((item) => {
        if (item.type == "line") {
            legendData.push({
                name: item.name,
                icon: "path://M0,0 L3,0 L3,1 L0,1 Z"
            });
        } else {
            legendData.push({
                name: item.name,
                icon: "path://M0,0 L6,0 L6,6 L0,6 Z"
            });
        }

        colorList.push(item.color);
        return {
            name: item.name,
            type: item.type,
            lineStyle: {
                width: 2,
            },
            barWidth: 20,
            barBorderRadius: 6,
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: false,
            smooth: false,
            data: item.data,
            areaStyle: {
                color: '#1DA5000A',
            },
        };
    })
    return {
        color: colorList,
        tooltip: {
            show: true
        },
        legend: {
            data: legendData,
            right: 10,
            top: 0,
            itemWidth: 10,
            itemGap: 20,
            textStyle: {
                fontSize: 16
            }
        },
        grid: {
            left: '20px',
            right: '24px',
            top: '30px',
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
            data: propsData.xAxis,
        },
        yAxis: [
            {
                name: 'kW',
                type: 'value',
                boundaryGap: [0, 0.1],
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
        series: series,
    };
};