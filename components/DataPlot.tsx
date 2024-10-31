import React, { useState, useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Plot from "react-plotly.js";
import { Button, Text, Title } from "react-native-paper";
import Slider from "@react-native-community/slider";

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
  maxZoom?: number;
};

const DEFAULT_MAX_ZOOM = 5;
const colors = ["#7B1FA2", "#2196F3", "#FF9800", "#FFC107"];

export default function DataPlot({
  data,
  traces,
  title = "Titulo",
  xAxisLabel = "X AXIS",
  yAxisLabel = "Y AXIS",
  maxZoom = DEFAULT_MAX_ZOOM,
}: DataPlotProps) {
  const { width, height } = useWindowDimensions();
  const [visibleTraces, setVisibleTraces] = useState<Record<string, boolean>>(
    Object.fromEntries(traces.map((trace) => [trace.name, true]))
  );

  const [xZoom, setXZoom] = useState(0);
  const [yZoom, setYZoom] = useState(0);

  const dataRanges = useMemo(() => {
    const xValues = data.flatMap((d) => traces.map((t) => d[t.x]));
    const yValues = data.flatMap((d) => traces.map((t) => d[t.y]));

    return {
      x: {
        min: Math.min(...xValues),
        max: Math.max(...xValues),
      },
      y: {
        min: Math.min(...yValues),
        max: Math.max(...yValues),
      },
    };
  }, [data, traces]);

  const plotlyData = useMemo(() => {
    return traces
      .map((trace, index) => {
        const traceColor = colors[index % colors.length];
        return {
          x: data.map((d) => d[trace.x]),
          y: data.map((d) => d[trace.y]),
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
        };
      })
      .filter((trace) => trace.visible);
  }, [data, traces, visibleTraces]);

  const getAxisRange = (range: { min: number; max: number }, zoom: number) => {
    const mid = (range.max + range.min) / 2;
    const fullSpan = range.max - range.min;
    const zoomFactor = Math.exp(-zoom);
    const halfSpan = (fullSpan * zoomFactor) / 2;
    return [mid - halfSpan, mid + halfSpan];
  };

  const layout = {
    showlegend: false,
    xaxis: {
      color: "grey",
      showgrid: true,
      zeroline: true,
      gridcolor: "#E4E4E4",
      gridwidth: 1,
      hoverformat: " ",
      range: getAxisRange(dataRanges.x, xZoom),
      title: "",
    },
    yaxis: {
      color: "grey",

      showgrid: true,
      zeroline: true,
      gridcolor: "#E4E4E4",
      gridwidth: 1,
      hoverformat: " ",
      range: getAxisRange(dataRanges.y, yZoom),
      title: "",
    },
    plot_bgcolor: "white",
    paper_bgcolor: "white",
    margin: { l: 20, r: 20, t: 20, b: 20 },
    hovermode: false,
    height: 200,
    autosize: false,
  };

  const config = {
    displayModeBar: false,
    responsive: false,
    staticPlot: true,
  };

  const toggleTrace = (traceName: string) => {
    setVisibleTraces((prev) => ({
      ...prev,
      [traceName]: !prev[traceName],
    }));
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <View style={styles.xAxisContainer}>
          <Text style={styles.yAxisLabel}>{yAxisLabel}</Text>
          <Slider
            value={yZoom}
            onValueChange={setYZoom}
            minimumValue={-1}
            maximumValue={1}
            step={0.01}
          />
        </View>
        <Title style={styles.title}>{title}</Title>

        <View style={styles.yAxisContainer}>
          <Text style={styles.xAxisLabel}>{xAxisLabel}</Text>
          <Slider
            value={xZoom}
            onValueChange={setXZoom}
            minimumValue={-1}
            maximumValue={1}
            step={0.01}
          />
        </View>
      </View>
      <View style={styles.plotWrapper}>
        <View style={styles.plotContainer}>
          <Plot
            data={plotlyData}
            layout={layout}
            config={config}
            style={styles.plot}
          />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
	paddingHorizontal: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    color: "black",
  },
  plotWrapper: {
    width: "100%",
    position: "relative",
  },
  plotContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    height: 200,
  },
  plot: {
    width: "100%",
    height: "100%",
  },
  yAxisContainer: {
    zIndex: 2,
  },
  xAxisContainer: {
    zIndex: 2,
  },
  xAxisLabel: {
    color: "black",
    fontWeight: "bold",
  },
  yAxisLabel: {
    color: "black",
    fontWeight: "bold",
    marginBottom: 8,
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
  activeButton: {
    backgroundColor: "white",
    borderColor: "#E4E4E4",
  },
});
