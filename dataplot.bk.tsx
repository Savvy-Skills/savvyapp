import React, { useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Plot from "react-plotly.js";
import { Button, Text } from "react-native-paper";
import { Data, Layout, Config } from "plotly.js";

type TraceConfig = {
  x: string;
  y: string;
  name: string;
};

type DataPlotProps = {
  data: Record<string, number>[];
  traces: TraceConfig[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  zoomLevel?: number;
};

const colors = ["#7B1FA2", "#2196F3", "#FF9800", "#FFC107"];

export default function DataPlot({
  data,
  traces,
  title = "Titulo",
  xAxisLabel = "X AXIS",
  yAxisLabel = "Y AXIS",
  zoomLevel = 0,
}: DataPlotProps) {
  const [visibleTraces, setVisibleTraces] = useState<Record<string, boolean>>(
    Object.fromEntries(traces.map((trace) => [trace.name, true]))
  );
  const [isScatterPlot, setIsScatterPlot] = useState(true);

  const ranges = useMemo(() => {
    const xValues = data.flatMap((d) => traces.map((t) => d[t.x]));
    const yValues = data.flatMap((d) => traces.map((t) => d[t.y]));
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    const xPadding = (xMax - xMin) * 0.1;
    const yPadding = (yMax - yMin) * 0.1;
    
    return {
      x: [xMin - xPadding - zoomLevel, xMax + xPadding + zoomLevel],
      y: [yMin - yPadding - zoomLevel, yMax + yPadding + zoomLevel],
    };
  }, [data, traces, zoomLevel]);

  const plotlyData: Data[] = useMemo(() => {
    return traces
      .map((trace, index) => {
        const traceColor = colors[index % colors.length];
        return {
          x: data.map((d) => d[trace.x]),
          y: data.map((d) => d[trace.y]),
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
      .filter((trace) => trace.name && visibleTraces[trace.name]);
  }, [data, traces, visibleTraces, isScatterPlot]);

  const layout: Partial<Layout> = {
    showlegend: false,
    xaxis: {
      color: "grey",
      showgrid: true,
      zeroline: true,
      gridcolor: "#E4E4E4",
      gridwidth: 1,
      hoverformat: " ",
      range: ranges.x,
      title: {
        text: "",
      },
    },
    yaxis: {
      color: "grey",
      showgrid: true,
      zeroline: true,
      gridcolor: "#E4E4E4",
      gridwidth: 1,
      hoverformat: " ",
      range: ranges.y,
      title: {
        text: "",
      },
    },
    margin: { l: 20, r: 30, t: 20, b: 40 },
    hovermode: false,
    autosize: false,
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
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      <View style={styles.plotWrapper}>
        <View style={styles.yAxisLabelContainer}>
          <Text style={styles.axisLabel} accessibilityRole="text">{yAxisLabel}</Text>
        </View>
        <View style={styles.plotContainer}>
          <Plot
            data={plotlyData}
            layout={layout}
            config={config}
            style={styles.plot}
          />
        </View>
        <View style={styles.xAxisLabelContainer}>
          <Text style={styles.axisLabel} accessibilityRole="text">{xAxisLabel}</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        {traces.map((trace, index) => (
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
      </View>
      <Button
        mode="contained"
        onPress={togglePlotType}
        style={styles.plotTypeButton}
      >
        {isScatterPlot ? "Show Lines" : "Hide Lines"}
      </Button>
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
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