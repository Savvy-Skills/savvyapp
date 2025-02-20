'use dom'
import { Config, Data, Layout, PlotHoverEvent } from "plotly.js";
import Plot from "react-plotly.js";

interface DataPlotterProps {
  data: Data[];
  layout: Partial<Layout>;
  config: Partial<Config>;
  style: React.CSSProperties;
  onHover: (data: any) => void;
  onPointClick: (data: any) => void;
  dom: import("expo/dom").DOMProps;
}

const DataPlotter = (props: DataPlotterProps) => {
  const { data, layout, config, style, onHover, onPointClick } = props;

  const handleHover = (event: PlotHoverEvent) => {
    onHover(event.points);
  };

  const handlePointClick = (event: any) => {
    onPointClick(event.points);
  };

  return <Plot data={data} layout={layout} config={config} style={style} onHover={handleHover} onClick={handlePointClick} />;
};

export default DataPlotter;