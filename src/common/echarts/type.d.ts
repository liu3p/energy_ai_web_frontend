import {BarSeriesOption, LineSeriesOption, PieSeriesOption, CustomSeriesOption} from 'echarts/charts';
import * as echarts from 'echarts';

type ChartType = 'bar' | 'line' | 'pie' | 'custom';

type BarOption = echarts.ComposeOption<BarSeriesOption>;
type LineOption = echarts.ComposeOption<LineSeriesOption>;
type PieOption = echarts.ComposeOption<PieSeriesOption>;
type CustomOption = echarts.ComposeOption<CustomSeriesOption>;

export {ChartType, BarOption, PieOption, LineOption, CustomOption};
