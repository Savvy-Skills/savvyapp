import React from 'react';
import Plot from 'react-plotly.js';
import { PlotData, Layout, Config } from 'plotly.js';

interface ChartProps {
  data: Partial<PlotData>[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
  style?: React.CSSProperties;
}

const Chart: React.FC<ChartProps> = ({ 
  data, 
  layout = {}, 
  config = {}, 
  className = '', 
  style = {} 
}) => {
  const defaultLayout = {
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    font: { family: 'Arial, sans-serif', size: 12, color: '#333' },
    autosize: true,
    height: 200,
    margin: { l: 50, r: 30, t: 30, b: 50 },
    ...layout
  };

  const defaultConfig = {
    responsive: true,
    displayModeBar: 'hover' as const,
    displaylogo: false,
    ...config
  };

  const containerStyle = {
    height: '200px',
    maxHeight: '200px',
    width: '100%',
    ...style
  };

  return (
    <div className={`chart-container ${className}`} style={containerStyle}>
      <Plot
        data={data}
        layout={defaultLayout}
        config={defaultConfig}
        style={{width: '100%', height: '100%'}}
        useResizeHandler={true}
      />
    </div>
  );
};

export default Chart;
