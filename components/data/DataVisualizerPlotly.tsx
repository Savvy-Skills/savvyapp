import React, { useState, useMemo, lazy, Suspense, useEffect, useCallback } from "react";
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

let DataPlotter = lazy(() => import("@/components/data/DataPlotter"));

export type TraceConfig = {
  x: string;
  y: string;
  name: string;
  type: "scatter" | "bar" | "histogram";
  groupBy?: string;
  stack?: boolean;
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
  "#FF9800",
  "#2196F3",
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
  traces = [],
  title = "Data Visualizer",
  xAxisLabel = "X AXIS",
  yAxisLabel = "Y AXIS",
}: DataVisualizerProps) {
  const initialColumn = dataset.length > 0 ? Object.keys(dataset[0])[0] : null;

  const [activeChartType, setActiveChartType] = useState<PlotType>(traces[0].type);
  const [visibleTraces, setVisibleTraces] = useState<Record<string, boolean>>(
    Object.fromEntries(traces.map((trace) => [trace.name, true]))
  );
  const [pieMode, setPieMode] = useState<"frequency" | "sum">("frequency");

  const [selectedColumn, setSelectedColumn] = useState<string | null>(
    initialColumn
  );
  const [histogramColumn, setHistogramColumn] = useState<string | null>(
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
		// TODO: Ignore disabled traces
        return traces.map((trace, index) => {
			if (!visibleTraces[trace.name]) return {};
          const barData: Record<string, number> = {};
          dataset.forEach((item) => {
            const value = String(item[trace.x]);
            barData[value] = (barData[value] || 0) + item[trace.y];
          });
          return {
            type: "bar",
            x: Object.keys(barData),
            y: Object.values(barData),
            name: trace.name,
            marker: {
              color: colors[index % colors.length],
            },
          } as Data;
        });
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
    }
  }, [
    dataset,
    traces,
    activeChartType,
    visibleTraces,
    pieMode,
    selectedColumn,
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
        },
    margin: ["pie"].includes(activeChartType)
      ? { l: 10, r: 10, t: 10, b: 10 }
      : { l: 40, r: 20, t: 10, b: 20 },
    hovermode: false,
    autosize: true,
    bargap: 0.1,
	barmode: traces.some(trace => trace.stack) ? "stack" : "group",
	plot_bgcolor: "transparent",
	paper_bgcolor: "transparent",
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
	  {/* Add Y Axis Label */}
	  {!["pie"].includes(activeChartType) && (
		<View style={styles.yAxisLabelContainer}>
			<Text style={styles.axisLabel}>{yAxisLabel}</Text>
		</View>
	  )}
      <View style={styles.plotWrapper}>
        {/* {!["pie"].includes(activeChartType) && (
          <>
            <View style={styles.yAxisLabelContainer}>
              <Text style={styles.axisLabel}>{yAxisLabel}</Text>
            </View>
            <View style={styles.xAxisLabelContainer}>
              <Text style={styles.axisLabel}>{xAxisLabel}</Text>
            </View>
          </>
        )} */}
        <View style={styles.plotContainer}>
          <Suspense fallback={<ActivityIndicator />}>
            <DataPlotter
              data={plotlyData}
              layout={layout}
              config={config}
              style={styles.plot}
			  dom={{scrollEnabled: false}}
            />
          </Suspense>
        </View>
	  {/* Add X Axis Label */}
	  {!["pie"].includes(activeChartType) && (
		<View style={styles.xAxisLabelContainer}>
			<Text style={styles.axisLabel}>{xAxisLabel}</Text>
		</View>
	  )}
      </View>
	  {/* Add Buttons for each trace */}
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
        {activeChartType === "scatter" && traces.length > 1 &&
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
  },
  plotContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    height: 350,
  },
  plot: {
    width: "100%",
    height: "100%",
  },
  yAxisLabelContainer: {
    justifyContent: "center",
    zIndex: 1,
  },
  axisLabel: {
    color: "black",
    fontWeight: "bold",
  },
  xAxisLabelContainer: {
    alignItems: "flex-end",
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
    boxShadow: "0 1px 1.5px rgba(0, 0, 0, 0.2)",
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
