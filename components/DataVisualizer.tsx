import React, { useState } from "react";

import { CartesianChart, Bar, useChartPressState } from "victory-native";
import { Circle, useFont, vec } from "@shopify/react-native-skia";
import { View, useColorScheme } from "react-native";
import { LinearGradient, Text as SKText } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "react-native-paper";


const DATA = (length: number = 10) =>
  Array.from({ length }, (_, index) => ({
    month: index + 1,
    listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
  }));

const BarChart = () => {
  const [data, setData] = useState(DATA(5));
  const { theme } = useThemeStore();
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { listenCount: 0 },
  });

  const isDark = theme.dark;

  const value = useDerivedValue(() => {
    return "$" + state.y.listenCount.value.value;
  }, [state]);


  return (
    <View
    >
      <View>
        <CartesianChart
          xKey="month"
          padding={5}
          yKeys={["listenCount"]}
          domain={{ y: [0, 100] }}
          domainPadding={{ left: 50, right: 50, top: 30 }}
          axisOptions={{
            tickCount: 5,
            formatXLabel: (value) => {
              const date = new Date(2023, value - 1);
              return date.toLocaleString("default", { month: "short" });
            },
            lineColor: isDark ? "#71717a" : "#d4d4d8",
            labelColor: isDark ? "white" : "black",
          }}
          chartPressState={state}
          data={data}
        >
          {({ points, chartBounds }) => {
            return (
              <>
                <Bar
                  points={points.listenCount}
                  chartBounds={chartBounds}
                  animate={{ type: "timing", duration: 1000 }}
                  roundedCorners={{
                    topLeft: 10,
                    topRight: 10,
                  }}
                >
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(0, 400)}
                    colors={["green", "#90ee9050"]}
                  />
                </Bar>

                {isActive ? (
                  <>
                    <Circle
                      cx={state.x.position}
                      cy={state.y.listenCount.position}
                      r={8}
                      color={"grey"}
                      opacity={0.8}
                    />
                  </>
                ) : null}
              </>
            );
          }}
        </CartesianChart>
      </View>
      <View>
        <Button
          onPress={() => {
            setData(DATA(5));
          }}
        >
          <Button mode="text">Update Chart</Button>
        </Button>
      </View>
    </View>
  );
};

export default BarChart;