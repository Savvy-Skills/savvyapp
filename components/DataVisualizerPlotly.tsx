'use dom';

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Plot from "react-plotly.js";
import { Button, SegmentedButtons, Text } from "react-native-paper";
import { Data, Layout, Config, PlotType } from "plotly.js";

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

export default function DataVisualizerPlotly({
  dataset,
  traces,
  title = "Data Visualizer",
  xAxisLabel = "X AXIS",
  yAxisLabel = "Y AXIS",
}: DataVisualizerProps) {
  const [activeChartType, setActiveChartType] = useState<PlotType>("scatter");
  const [visibleTraces, setVisibleTraces] = useState<Record<string, boolean>>(
    Object.fromEntries(traces.map((trace) => [trace.name, true]))
  );
  const [isScatterPlot, setIsScatterPlot] = useState(true);
  const [pieMode, setPieMode] = useState<"frequency" | "sum">("frequency");
  const [selectedColumn, setSelectedColumn] = useState<string>(
    Object.keys(dataset[0])[0]
  );
  const [histogramColumn, setHistogramColumn] = useState<string>(
    Object.keys(dataset[0])[0]
  );
  const [barPlotColumn, setBarPlotColumn] = useState<string>(
    Object.keys(dataset[0])[0]
  );
  const { width } = useWindowDimensions();
  const buttonContainerStyle: {
    justifyContent: "center" | "flex-start";
    flex: number;
  } = {
    justifyContent: "center",
    flex: 1,
  };
  if (width < 600) {
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
    switch (activeChartType) {
      case "pie":
        if (pieMode === "frequency") {
          const frequencies: Record<string, number> = {};
          dataset.forEach((item) => {
            const value = String(item[selectedColumn]);
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
          const value = String(item[barPlotColumn]);
          barData[value] = (barData[value] || 0) + 1;
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
            x: dataset.map((item) => item[histogramColumn]),
            marker: {
              color: colors[0],
            },
          } as Data,
        ];
      default:
        return traces
          .map((trace, index) => {
            const traceColor = colors[index % colors.length];
            return {
              x: dataset.map((d) => d[trace.x]),
              y: dataset.map((d) => d[trace.y]),
              name: trace.name,
              type: "scatter",
              mode: isScatterPlot ? "markers" : "lines+markers",
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
          .filter((trace) => (trace as any).visible);
    }
  }, [
    dataset,
    traces,
    activeChartType,
    visibleTraces,
    isScatterPlot,
    pieMode,
    selectedColumn,
    barPlotColumn,
    histogramColumn,
  ]);

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
            text: activeChartType === "histogram" ? histogramColumn : "",
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

  const togglePlotType = () => {
    setIsScatterPlot((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={activeChartType}
        onValueChange={(value) => setActiveChartType(value as PlotType)}
        buttons={chartTypeOptions}
        style={{ marginBottom: 16 }}
      />
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
          <Plot
            data={plotlyData}
            layout={layout}
            config={config}
            style={styles.plot}
          />
        </View>
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={buttonContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {activeChartType === "pie" &&
          pieMode === "frequency" &&
          Object.keys(dataset[0]).map((columnName, index) => (
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
          Object.keys(dataset[0]).map((columnName, index) => (
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
          Object.keys(dataset[0]).map((columnName, index) => (
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
      {activeChartType === "scatter" && (
        <Button
          mode="contained"
          onPress={togglePlotType}
          style={styles.plotTypeButton}
        >
          {isScatterPlot ? "Show Lines" : "Hide Lines"}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 16,
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