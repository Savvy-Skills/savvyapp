import React, { useState, useMemo, lazy, Suspense, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  SegmentedButtons,
  Text,
} from "react-native-paper";
import { Data, Layout, Config, PlotType } from "plotly.js";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { groupByColumn } from "@/utils/utilfunctions";

let DataPlotter = lazy(() => import("@/components/DataPlotter"));

export type TraceConfig = {
  x: string;
  y: string;
  name: string;
  type: "scatter" | "bar" | "histogram";
  groupBy?: string;
};

export type DataVisualizerProps = {
  dataset: Record<string, any>[];
  traces?: TraceConfig[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
};

const colors = [
  "#7B1FA2",
  "#2196F3",
  "#FF9800",
  "#FFC107",
  "#4CAF50",
  "#E91E63",
  "#9C27B0",
  "#00BCD4",
  "#FFEB3B",
  "#FF5722",
];

const TENDENCY_LINES = [
  "linear",
  "exponential",
  "polynomial",
  "logarithmic",
  "power",
];

type TendencyLine = (typeof TENDENCY_LINES)[number];

function getTendencyTraces(dataset: Record<string, any>[], type: TendencyLine) {
  switch (type) {
    case "linear":
      // Calculate linear tendency line
      const xValues = dataset.map((item) => item.x);
      const yValues = dataset.map((item) => item.y);
      const xMean = xValues.reduce((a, b) => a + b) / xValues.length;
      const yMean = yValues.reduce((a, b) => a + b) / yValues.length;
      const numerator = xValues.reduce(
        (acc, x, i) => acc + (x - xMean) * (yValues[i] - yMean),
        0
      );
      const denominator = xValues.reduce((acc, x) => acc + (x - xMean) ** 2, 0);

      const m = numerator / denominator;
      const b = yMean - m * xMean;

      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = m * xMin + b;
      const yMax = m * xMax + b;

      return [
        {
          x: [xMin, xMax],
          y: [yMin, yMax],
          type: "scatter",
          mode: "lines",
          line: {
            color: "grey",
            dash: "dot",
          },
          showlegend: false,
        } as Data,
      ];
    default:
      return {};
  }
}

export default function DataVisualizerPlotly({
  dataset,
  traces = [],
  title = "Data Visualizer",
  xAxisLabel = "X AXIS",
  yAxisLabel = "Y AXIS",
}: DataVisualizerProps) {
  const initialColumn = dataset.length > 0 ? Object.keys(dataset[0])[0] : null;

  const [activeChartType, setActiveChartType] = useState<PlotType>("scatter");
  const [visibleTraces, setVisibleTraces] = useState<Record<string, boolean>>(
    Object.fromEntries(traces.map((trace) => [trace.name, true]))
  );
  const [showLine, setShowLine] = useState<null | TendencyLine>(null);
  const [pieMode, setPieMode] = useState<"frequency" | "sum">("frequency");

  const [selectedColumn, setSelectedColumn] = useState<string | null>(
    initialColumn
  );
  const [histogramColumn, setHistogramColumn] = useState<string | null>(
    initialColumn
  );
  const [barPlotColumn, setBarPlotColumn] = useState<string | null>(
    initialColumn
  );

  const { width } = useWindowDimensions();
  const buttonContainerStyle: {
    justifyContent: "center" | "flex-start";
    flex: number;
  } = {
    justifyContent: "center",
    flex: 1,
  };
  if (width < SLIDE_MAX_WIDTH) {
    buttonContainerStyle.justifyContent = "flex-start";
  }
  const chartTypeOptions = [
    { label: "Scatter", value: "scatter" },
    { label: "Bar", value: "bar" },
    { label: "Histogram", value: "histogram" },
    { label: "Pie", value: "pie" },
  ];
  const pieModeOptions = [
    { label: "Frequency", value: "frequency" },
    { label: "Sum", value: "sum" },
  ];

  const ranges = useMemo(() => {
    if (["pie", "bar", "histogram"].includes(activeChartType)) return null;
    const xValues = dataset.flatMap((d) => traces.map((t) => d[t.x]));
    const yValues = dataset.flatMap((d) => traces.map((t) => d[t.y]));
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const xPadding = (xMax - xMin) * 0.2;
    const yPadding = (yMax - yMin) * 0.2;
    return {
      x: [xMin - xPadding, xMax + xPadding],
      y: [yMin - yPadding, yMax + yPadding],
    };
  }, [dataset, traces, activeChartType]);

  const plotlyData: Data[] = useMemo(() => {
    if (dataset.length === 0) return [];
    switch (activeChartType) {
      case "pie":
        if (pieMode === "frequency") {
          const frequencies: Record<string, number> = {};
          dataset.forEach((item) => {
            const value = selectedColumn ? String(item[selectedColumn]) : "";
            frequencies[value] = (frequencies[value] || 0) + 1;
          });
          return [
            {
              type: "pie",
              labels: Object.keys(frequencies),
              values: Object.values(frequencies),
              textinfo: "label+percent",
              hoverinfo: "none",
              showlegend: false,
              marker: {
                colors: colors,
              },
            } as Data,
          ];
        } else {
          const sums: Record<string, number> = {};
          dataset.forEach((item) => {
            Object.entries(item).forEach(([key, value]) => {
              if (typeof value === "number") {
                sums[key] = (sums[key] || 0) + value;
              }
            });
          });
          return [
            {
              type: "pie",
              labels: Object.keys(sums),
              values: Object.values(sums),
              textinfo: "label+percent",
              hoverinfo: "none",
              showlegend: false,
              marker: {
                colors: colors,
              },
            } as Data,
          ];
        }
      case "bar":
        const barData: Record<string, number> = {};
        dataset.forEach((item) => {
          if (barPlotColumn) {
            const value = String(item[barPlotColumn]);
            barData[value] = (barData[value] || 0) + 1;
          }
        });
        return [
          {
            type: "bar",
            x: Object.keys(barData),
            y: Object.values(barData),
            marker: {
              color: colors,
            },
          } as Data,
        ];
      case "histogram":
        return [
          {
            type: "histogram",
            x: dataset
              .map((item) => (histogramColumn ? item[histogramColumn] : null))
              .filter((value) => value !== null),
            marker: {
              color: colors[0],
            },
          } as Data,
        ];
      default:
		// If groupby is provided, then we should only have one trace, and we should group the data by the groupBy column and create new traces for each group
		if (traces.some(trace => trace.groupBy)) {
			const groupedData = groupByColumn(dataset, traces[0].groupBy);
			return Object.entries(groupedData).map(([group, data]) => {
				return {
					x: (data as Record<string, any>[]).map((d) => d[traces[0].x]),
					y: (data as Record<string, any>[]).map((d) => d[traces[0].y]),
					name: `${traces[0].name} - ${group}`,
					type: "scatter",
					mode: "markers",
					visible: visibleTraces[traces[0].name],
				};
			});
		}
        return traces
          .map((trace, index) => {
            const traceColor = colors[index % colors.length];
            return {
              x: dataset.map((d) => d[trace.x]),
              y: dataset.map((d) => d[trace.y]),
              name: trace.name,
              type: "scatter",
              mode: "markers",
              visible: visibleTraces[trace.name],
              line: {
                shape: "linear",
                color: traceColor,
              },
              marker: {
                size: 6,
                color: traceColor,
              },
              hoverinfo: "none",
              showlegend: false,
            } as Data;
          })
          .filter((trace) => (trace as any).visible)
          .concat(showLine ? getTendencyTraces(dataset, showLine) : []);
    }
  }, [
    dataset,
    traces,
    activeChartType,
    visibleTraces,
    showLine,
    pieMode,
    selectedColumn,
    barPlotColumn,
    histogramColumn,
  ]);

  useEffect(() => {
    if (dataset && showLine) {
      const traces = getTendencyTraces(dataset, showLine);
    }
  }, [dataset, showLine]);

  const layout: Partial<Layout> = {
    showlegend: false,
    xaxis: ["pie"].includes(activeChartType)
      ? { visible: false }
      : {
          color: "grey",
          showgrid: true,
          zeroline: true,
          gridcolor: "#E4E4E4",
          gridwidth: 1,
          hoverformat: " ",
          range: ranges?.x,
          title: {
            text: activeChartType === "histogram" ? histogramColumn || "" : "",
          },
        },
    yaxis: ["pie"].includes(activeChartType)
      ? { visible: false }
      : {
          color: "grey",
          showgrid: true,
          zeroline: true,
          gridcolor: "#E4E4E4",
          gridwidth: 1,
          hoverformat: " ",
          range: ranges?.y,
          title: {
            text: activeChartType === "bar" ? "Frequency" : "",
          },
        },
    margin: ["pie"].includes(activeChartType)
      ? { l: 10, r: 10, t: 10, b: 10 }
      : { l: 50, r: 30, t: 20, b: 50 },
    hovermode: false,
    autosize: true,
    bargap: 0.1,
  };

  const config: Partial<Config> = {
    displayModeBar: false,
    responsive: true,
    staticPlot: true,
  };

  const toggleTrace = (traceName: string) => {
    setVisibleTraces((prev) => ({
      ...prev,
      [traceName]: !prev[traceName],
    }));
  };

  const showTendencyLine = () => {
    if (showLine) {
      setShowLine(null);
    } else {
      setShowLine("linear");
    }
  };

  return (
    <View style={styles.container}>
      {/* <SegmentedButtons
        value={activeChartType}
        onValueChange={(value) => setActiveChartType(value as PlotType)}
        buttons={chartTypeOptions}
        style={{ marginBottom: 16 }}
      /> */}
      {activeChartType === "pie" && (
        <SegmentedButtons
          value={pieMode}
          onValueChange={(value) => setPieMode(value as "frequency" | "sum")}
          buttons={pieModeOptions}
          style={{ marginBottom: 16 }}
        />
      )}
      <View style={styles.plotWrapper}>
        {!["pie"].includes(activeChartType) && (
          <>
            <View style={styles.yAxisLabelContainer}>
              <Text style={styles.axisLabel}>{yAxisLabel}</Text>
            </View>
            <View style={styles.xAxisLabelContainer}>
              <Text style={styles.axisLabel}>{xAxisLabel}</Text>
            </View>
          </>
        )}
        <View style={styles.plotContainer}>
          <Suspense fallback={<ActivityIndicator />}>
            <DataPlotter
              data={plotlyData}
              layout={layout}
              config={config}
              style={styles.plot}
            />
          </Suspense>
        </View>
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={buttonContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {activeChartType === "pie" &&
          pieMode === "frequency" &&
          Object.keys(dataset[0] || {}).map((columnName, index) => (
            <Button
              key={columnName}
              mode="outlined"
              onPress={() => setSelectedColumn(columnName)}
              style={[
                styles.button,
                selectedColumn !== columnName && styles.disabledButton,
              ]}
              icon={() => (
                <View
                  style={[
                    styles.colorSquare,
                    { backgroundColor: colors[index % colors.length] },
                  ]}
                />
              )}
            >
              {columnName}
            </Button>
          ))}
        {activeChartType === "bar" &&
          Object.keys(dataset[0] || {}).map((columnName, index) => (
            <Button
              key={columnName}
              mode="outlined"
              onPress={() => setBarPlotColumn(columnName)}
              style={[
                styles.button,
                barPlotColumn !== columnName && styles.disabledButton,
              ]}
              icon={() => (
                <View
                  style={[
                    styles.colorSquare,
                    { backgroundColor: colors[index % colors.length] },
                  ]}
                />
              )}
            >
              {columnName}
            </Button>
          ))}
        {activeChartType === "histogram" &&
          Object.keys(dataset[0] || {}).map((columnName, index) => (
            <Button
              key={columnName}
              mode="outlined"
              onPress={() => setHistogramColumn(columnName)}
              style={[
                styles.button,
                histogramColumn !== columnName && styles.disabledButton,
              ]}
              icon={() => (
                <View
                  style={[
                    styles.colorSquare,
                    { backgroundColor: colors[index % colors.length] },
                  ]}
                />
              )}
            >
              {columnName}
            </Button>
          ))}
        {activeChartType === "scatter" &&
          traces.map((trace, index) => (
            <Button
              key={trace.name}
              mode="outlined"
              onPress={() => toggleTrace(trace.name)}
              style={[
                styles.button,
                !visibleTraces[trace.name] && styles.disabledButton,
              ]}
              icon={() => (
                <View
                  style={[
                    styles.colorSquare,
                    { backgroundColor: colors[index % colors.length] },
                  ]}
                />
              )}
            >
              {trace.name}
            </Button>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: SLIDE_MAX_WIDTH,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  plotWrapper: {
    width: "100%",
    position: "relative",
    marginBottom: 20,
  },
  plotContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    height: 250,
  },
  plot: {
    width: "100%",
    height: "100%",
  },
  yAxisLabelContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    zIndex: 1,
  },
  axisLabel: {
    color: "black",
    fontWeight: "bold",
  },
  xAxisLabelContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    alignItems: "center",
    zIndex: 1,
  },
  chartTypeButtons: {
    flex: 1,
    justifyContent: "center",
  },
  pieModeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  button: {
    minWidth: 100,
    borderRadius: 5,
    backgroundColor: "white",
    borderColor: "#E4E4E4",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    margin: 4,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#F5F5F5",
  },
  colorSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  plotTypeButton: {
    marginTop: 16,
    alignSelf: "center",
  },
});
