'use dom'
import React, { lazy, useEffect, useState } from 'react';
// @ts-ignore
// import Chart from './Chart';

// let DataPlotter = lazy(() => import("@/components/data/DataPlotter"));
let Chart = lazy(() => import("./Chart"));


interface AudioWaveChartProps {
	peaks?: number[][] | number[] | null;
	duration?: number;
	className?: string;
	style?: React.CSSProperties;
	showContinuous?: boolean;
	showDiscrete?: boolean;
}

const AudioWaveChart: React.FC<AudioWaveChartProps> = ({
	peaks = null,
	duration = 0,
	className = '',
	style = {},
	showContinuous = true,
	showDiscrete = true
}) => {
	const [continuousWaveData, setContinuousWaveData] = useState<any[]>([]);
	const [discreteWaveData, setDiscreteWaveData] = useState<any[]>([]);

	useEffect(() => {
		if (peaks && duration > 0) {
			generateWaveformFromPeaks(peaks, duration);
		}
	}, [peaks, duration]);

	const generateWaveformFromPeaks = (peakData: number[][] | number[], duration: number) => {
		// WaveSurfer peaks data is typically in the format of [negative_peaks, positive_peaks]
		// We only need to use one set to avoid duplication
		let flatPeaks: number[];

		if (Array.isArray(peakData[0])) {
			// If 2D array, just take the first array (usually the positive peaks)
			flatPeaks = (peakData as number[][])[0];
		} else {
			flatPeaks = peakData as number[];
		}

		const timeValues: number[] = [];
		const amplitudeValues: number[] = [];
		const discreteTimeValues: number[] = [];
		const discreteValues: number[] = [];

		// Create time points evenly distributed across the duration
		const pointCount = flatPeaks.length;
		const timeStep = duration / pointCount;

		for (let i = 0; i < pointCount; i++) {
			// Ensure time values are always positive
			const time = Math.max(0, i * timeStep);
			const value = flatPeaks[i];

			timeValues.push(time);
			amplitudeValues.push(value);

			// Make sure we start with a discrete sample at position 0
			if (i === 0 || i % 5 === 0) {
				discreteTimeValues.push(time);
				discreteValues.push(value);
			}
		}

		// Set data for continuous wave chart
		setContinuousWaveData([
			{
				x: timeValues,
				y: amplitudeValues,
				type: 'scatter',
				mode: 'lines',
				name: 'Continuous Sound Wave',
				line: {
					color: '#fbbf24',
					width: 2
				}
			}
		]);

		// Set data for discrete wave chart
		setDiscreteWaveData([
			{
				x: discreteTimeValues,
				y: discreteValues,
				type: 'scatter',
				mode: 'lines+markers',
				name: 'Discrete Samples',
				marker: {
					color: '#f97316',
					size: 4
				}
			}
		]);
	};

	const continuousLayout = {
		// title: 'Original Continuous Sound Wave',
		xaxis: {
			title: 'Time (seconds)',
			showgrid: true,
			gridcolor: '#e0e0e0',
			range: [0, duration] as [number, number]
		},
		yaxis: {
			title: 'Amplitude',
			showgrid: true,
			gridcolor: '#e0e0e0'
		},
		plot_bgcolor: 'transparent',
		paper_bgcolor: 'transparent',
		margin: { l: 30, r: 16, t: 0, b: 40 }
	};

	const discreteLayout = {
		// title: 'Sampled Sound Wave (Discrete Samples)',
		xaxis: {
			title: 'Time (seconds)',
			showgrid: true,
			gridcolor: '#e0e0e0',
			range: [0, duration] as [number, number]
		},
		yaxis: {
			title: 'Amplitude',
			showgrid: true,
			gridcolor: '#e0e0e0'
		},
		plot_bgcolor: 'transparent',
		paper_bgcolor: 'transparent',
		margin: { l: 30, r: 16, t: 0, b: 40 }
	};

	const chartConfig = {
		responsive: true,
		displayModeBar: false
	};

	if (!peaks || !Array.isArray(peaks) || peaks.length === 0) {
		return (
			<div className="chart-placeholder">
				<p>No audio data available</p>
			</div>
		);
	}

	return (
		<div className={`audio-wave-chart-container ${className}`} style={style}>
			{showContinuous && (
				<div className="chart-wrapper">
					<Chart
						data={continuousWaveData}
						layout={continuousLayout}
						config={chartConfig}
					/>
				</div>
			)}

			{showDiscrete && (
				<div className="chart-wrapper">
					<Chart data={discreteWaveData} layout={discreteLayout} config={chartConfig} />
				</div>
			)}
		</div>
	);
};

export default AudioWaveChart;
