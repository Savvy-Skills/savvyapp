'use dom'
import { useState } from "react";
import AudioWaveChart from "../AudioWaveChart";
import InfoPanel from "../../../ui/InfoPanel";

interface AudioSamplingVisualizerProps {
	peaks: number[][];
	audioBuffer?: AudioBuffer;
}

export default function AudioSamplingVisualizer({
	peaks,
	audioBuffer
}: AudioSamplingVisualizerProps) {
	const [activeTab, setActiveTab] = useState<'both'|'continuous'|'discrete'>('both');
	
	return (
		<div className="audio-sampling-visualizer">
			<div className="audio-sampling-tabs">
				<button 
					className={`sampling-tab ${activeTab === 'both' ? 'active' : ''}`}
					onClick={() => setActiveTab('both')}
				>
					Continuous & Discrete View
				</button>
				<button 
					className={`sampling-tab ${activeTab === 'continuous' ? 'active' : ''}`}
					onClick={() => setActiveTab('continuous')}
				>
					Continuous Only
				</button>
				<button 
					className={`sampling-tab ${activeTab === 'discrete' ? 'active' : ''}`}
					onClick={() => setActiveTab('discrete')}
				>
					Discrete Only
				</button>
			</div>
			
			<div className="sampling-visualization">
				{peaks && Array.isArray(peaks) && peaks.length > 0 ? (
					<AudioWaveChart 
						key={peaks.length + activeTab}
						peaks={peaks} 
						duration={audioBuffer?.duration || 0} 
						showContinuous={activeTab === 'both' || activeTab === 'continuous'}
						showDiscrete={activeTab === 'both' || activeTab === 'discrete'}
					/>
				) : (
					<div className="sampling-placeholder">
						<p>Loading audio data or select an audio source...</p>
					</div>
				)}
			</div>
			
			<InfoPanel>
				<p>
					The top chart shows the continuous audio wave as it would exist in nature. 
					The bottom chart shows discrete samples - the individual measurements a computer 
					takes to represent the audio digitally.
				</p>
			</InfoPanel>
		</div>
	);
} 