import { LineOption } from '@/common/echarts/type';
type chartParams = {
    xAxis: (number | string)[];
    data: { name: string; type: 'line' | 'bar'; color: string; data: (number | string)[] }[];
    unit?: string;
    /** 为 true 时横轴仅展示整点标签（如 00:00、01:00） */
    xAxisLabelHourly?: boolean;
};
export const initOptions = (options?: chartParams): LineOption & {
    xAxis: echarts.XAXisComponentOption & { data: Array<number | string | null> };
    series: echarts.SeriesOption[];
} => {
    const propsData = options ?? {
        xAxis: [],
        data: [],
        unit: ""
    };
    const hasBar = propsData.data.some(item => item.type === 'bar');
    const categoryCount = propsData.xAxis.length;
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
        if (item.color) {
            colorList.push(item.color);
        }
        const seriesData =
            item.type === 'bar'
                ? item.data.map(value => {
                      const numeric = typeof value === 'number' ? value : Number(value);
                      const isNegative = !Number.isNaN(numeric) && numeric < 0;
                      return {
                          value,
                          itemStyle: {
                              // 正数圆上角，负数圆下角
                              borderRadius: isNegative ? [0, 0, 6, 6] : [6, 6, 0, 0],
                          },
                      };
                  })
                : item.data;
        return {
            name: item.name,
            type: item.type,
            lineStyle: {
                width: 2,
            },
            // 类目较少时加宽柱体，避免两侧空旷
            barWidth: hasBar && categoryCount <= 7 ? 28 : 20,
            barMaxWidth: 36,
            barGap: '30%',
            barCategoryGap: hasBar && categoryCount <= 7 ? '50%' : '35%',
            symbol: 'circle',
            symbolSize: 6,
            showSymbol: false,
            smooth: false,
            data: seriesData,
            areaStyle: item.type === 'line' ? {
                color: '#1DA5000A',
            } : undefined,
            itemStyle: item.type === 'bar'
                ? undefined
                : {
                      barBorderRadius: [6, 6, 0, 0],
                  },
        };
    })

    return {
        color: colorList.length > 0 ? colorList : ['#F43535', '#5CCF77', '#1A6FB5', '#E8841A', '#8B5CF6', '#0891B2'],
        tooltip: {
            show: true
        },
        legend: {
            data: legendData,
            right: 10,
            top: 4,
            itemWidth: 10,
            itemGap: 20,
            textStyle: {
                fontSize: 14
            }
        },
        grid: {
            left: '20px',
            right: '24px',
            top: '38px',
            bottom: '12px',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            // 折线贴边；柱状保留类目间距，少量数据不会贴死左右两端
            boundaryGap: hasBar,
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
                ...(propsData.xAxisLabelHourly
                    ? {
                          interval: (_index: number, value: string) => String(value).endsWith(':00'),
                          hideOverlap: true,
                      }
                    : {}),
            },
            data: propsData.xAxis,
        },
        yAxis: [
            {
                name: propsData.unit ?? '',
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
