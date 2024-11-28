'use dom'
import { Config, Data, Layout } from "plotly.js";
import Plot from "react-plotly.js";

interface DataPlotterProps {
  data: Data[];
  layout: Partial<Layout>;
  config: Partial<Config>;
  style: React.CSSProperties;
}

const DataPlotter = (props: DataPlotterProps) => {
  const { data, layout, config, style } = props;

  return <Plot data={data} layout={layout} config={config} style={style} />;
};

export default DataPlotter;