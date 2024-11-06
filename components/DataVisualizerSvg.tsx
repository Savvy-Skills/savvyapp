import React, { useState, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';
import Svg, { G, Line, Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import * as d3 from 'd3';

type TraceConfig = {
  x: string;
  y: string;
  name: string;
};

type DataVisualizerProps = {
  dataset: Record<string, any>[];
  traces: TraceConfig[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
};

const colors = [
  '#7B1FA2',
  '#2196F3',
  '#FF9800',
  '#FFC107',
  '#4CAF50',
  '#E91E63',
  '#9C27B0',
  '#00BCD4',
  '#FFEB3B',
  '#FF5722',
];

const CHART_PADDING = 40;
const TICK_LENGTH = 5;

type ChartType = 'line' | 'bar' | 'pie' | 'histogram';

type ChartDataPoint = {
  x: string | number;
  y: number;
};

const createLinearScale = (
  data: ChartDataPoint[],
  range: [number, number],
  accessor: (d: ChartDataPoint) => number
) => {
  return d3.scaleLinear()
    .domain([Math.min(...data.map(accessor)), Math.max(...data.map(accessor))])
    .range(range);
};

const createBandScale = (
  data: ChartDataPoint[],
  range: [number, number]
) => {
  return d3.scaleBand()
    .domain(data.map(d => d.x.toString()))
    .range(range)
    .padding(0.1);
};

export default function DataVisualizer({
  dataset,
  traces,
  title,
  xAxisLabel,
  yAxisLabel,
}: DataVisualizerProps) {
  const { width } = useWindowDimensions();
  const [selectedTrace, setSelectedTrace] = useState(0);
  const [chartType, setChartType] = useState<ChartType>('line');
  const widthToUse = Math.min(600, width)
  const chartWidth = widthToUse - 32; // Accounting for container padding
  const chartHeight = chartWidth * 0.6;

  const chartData: ChartDataPoint[] = useMemo(() => {
    const selectedConfig = traces[selectedTrace];
    return dataset.map(item => ({
      x: item[selectedConfig.x],
      y: parseFloat(item[selectedConfig.y]),
    }));
  }, [dataset, traces, selectedTrace]);

  const xScale = useMemo(() => {
    const range: [number, number] = [CHART_PADDING, chartWidth - CHART_PADDING];
    if (chartType === 'bar' || chartType === 'histogram') {
      return createBandScale(chartData, range);
    }
    return createLinearScale(chartData, range, d => typeof d.x === 'string' ? parseFloat(d.x) : d.x);
  }, [chartData, chartWidth, chartType]);

  const yScale = useMemo(() => {
    const range: [number, number] = [chartHeight - CHART_PADDING, CHART_PADDING];
    return createLinearScale(chartData, range, d => d.y);
  }, [chartData, chartHeight]);

  const lineGenerator = useMemo(() => {
    return d3.line<ChartDataPoint>()
      .x(d => {
        const value = typeof d.x === 'string' ? parseFloat(d.x) : d.x;
        return xScale(value) as number;
      })
      .y(d => yScale(d.y));
  }, [xScale, yScale]);

  const pieGenerator = d3.pie<ChartDataPoint>().value(d => d.y);
  const arcGenerator = d3.arc<d3.PieArcDatum<ChartDataPoint>>().innerRadius(0).outerRadius(chartHeight / 2 - CHART_PADDING);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <G>
            <Path
              d={lineGenerator(chartData) || ''}
              stroke={colors[selectedTrace % colors.length]}
              strokeWidth="2"
              fill="none"
            />
            {chartData.map((point, index) => {
              const cx = xScale(typeof point.x === 'string' ? parseFloat(point.x) : point.x);
              return (
                <Circle
                  key={index}
                  cx={cx as number}
                  cy={yScale(point.y)}
                  r="4"
                  fill={colors[selectedTrace % colors.length]}
                />
              );
            })}
          </G>
        );
      case 'bar':
        return (
          <G>
            {chartData.map((point, index) => {
              const x = xScale(point.x.toString());
              return (
                <Rect
                  key={index}
                  x={x as number}
                  y={yScale(point.y)}
                  width={(xScale as d3.ScaleBand<string>).bandwidth()}
                  height={chartHeight - CHART_PADDING - yScale(point.y)}
                  fill={colors[selectedTrace % colors.length]}
                />
              );
            })}
          </G>
        );
      case 'pie':
        return (
          <G transform={`translate(${chartWidth / 2}, ${chartHeight / 2})`}>
            {pieGenerator(chartData).map((slice, index) => (
              <Path
                key={index}
                d={arcGenerator(slice) || ''}
                fill={colors[index % colors.length]}
              />
            ))}
          </G>
        );
      case 'histogram':
        const histogram = d3.histogram<ChartDataPoint, number>()
          .value(d => d.y)
          .domain(yScale.domain() as [number, number])
          .thresholds(yScale.ticks(10));

        const bins = histogram(chartData);
        const xHistScale = createBandScale(
          bins.map(bin => ({ x: bin.x0?.toString() || '', y: bin.length })),
          [CHART_PADDING, chartWidth - CHART_PADDING]
        );

        return (
          <G>
            {bins.map((bin, index) => {
              const x = xHistScale(bin.x0?.toString() || '');
              return (
                <Rect
                  key={index}
                  x={x as number}
                  y={yScale(bin.length)}
                  width={xHistScale.bandwidth()}
                  height={chartHeight - CHART_PADDING - yScale(bin.length)}
                  fill={colors[selectedTrace % colors.length]}
                />
              );
            })}
          </G>
        );
    }
  };

  const xTicks = chartType === 'bar' || chartType === 'histogram'
    ? (xScale as d3.ScaleBand<string>).domain()
    : (xScale as d3.ScaleLinear<number, number>).ticks(5);
  const yTicks = yScale.ticks(5);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* X-axis */}
          <Line
            x1={CHART_PADDING}
            y1={chartHeight - CHART_PADDING}
            x2={chartWidth - CHART_PADDING}
            y2={chartHeight - CHART_PADDING}
            stroke="black"
          />
          {xTicks.map((tick, index) => {
            const x = xScale(typeof tick === 'string' ? tick : tick.toString());
            return (
              <G key={index}>
                <Line
                  x1={x as number}
                  y1={chartHeight - CHART_PADDING}
                  x2={x as number}
                  y2={chartHeight - CHART_PADDING + TICK_LENGTH}
                  stroke="black"
                />
                <SvgText
                  x={x as number}
                  y={chartHeight - CHART_PADDING + TICK_LENGTH + 10}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {tick}
                </SvgText>
              </G>
            );
          })}

          {/* Y-axis */}
          <Line
            x1={CHART_PADDING}
            y1={CHART_PADDING}
            x2={CHART_PADDING}
            y2={chartHeight - CHART_PADDING}
            stroke="black"
          />
          {yTicks.map((tick, index) => (
            <G key={index}>
              <Line
                x1={CHART_PADDING - TICK_LENGTH}
                y1={yScale(tick)}
                x2={CHART_PADDING}
                y2={yScale(tick)}
                stroke="black"
              />
              <SvgText
                x={CHART_PADDING - TICK_LENGTH - 5}
                y={yScale(tick)}
                fontSize={10}
                textAnchor="end"
                alignmentBaseline="middle"
              >
                {tick}
              </SvgText>
            </G>
          ))}

          {renderChart()}
        </Svg>
      </View>
      <View style={styles.controlsContainer}>
        <SegmentedButtons
          value={chartType}
          onValueChange={(value) => setChartType(value as ChartType)}
          buttons={[
            { value: 'line', label: 'Line' },
            { value: 'bar', label: 'Bar' },
            { value: 'pie', label: 'Pie' },
            { value: 'histogram', label: 'Histogram' },
          ]}
        />
        {traces.length > 1 && (
          <SegmentedButtons
            value={selectedTrace.toString()}
            onValueChange={(value) => setSelectedTrace(parseInt(value))}
            buttons={traces.map((trace, index) => ({
              value: index.toString(),
              label: trace.name,
            }))}
          />
        )}
      </View>
      {xAxisLabel && <Text style={styles.axisLabel}>{xAxisLabel}</Text>}
      {yAxisLabel && (
        <Text style={[styles.axisLabel, styles.yAxisLabel]}>{yAxisLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    padding: 16,
	maxWidth: 600,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 16,
  },
  controlsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  axisLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  yAxisLabel: {
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
    left: -30,
    top: '50%',
  },
});