import React from "react";
import InfoPanel from "../../../../ui/InfoPanel";
import "./SpectrogramVisualizer.css";

// Define options for configuration dropdowns
const frequencyMinOptions = [0, 50, 100, 200, 500];
const frequencyMaxOptions = [5000, 8000, 10000, 15000, 20000];
const fftSamplesOptions = [256, 512, 1024, 2048, 4096];

interface SpectrogramVisualizerProps {
  audioFile?: File | null;
  audioUrl?: string | null;
  spectrogramRef: React.RefObject<HTMLDivElement>;
  config: {
    frequencyMin: number;
    frequencyMax: number;
    fftSamples: number;
  };
  onConfigChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onApplyChanges: () => void;
  hasChanges: boolean;
}

export default function SpectrogramVisualizer({
  spectrogramRef,
  config,
  onConfigChange,
  onApplyChanges,
  hasChanges
}: SpectrogramVisualizerProps) {
  return (
    <div className="spectrogram-visualizer">
      <InfoPanel>
        <p>
          A spectrogram visualizes audio frequencies over time. The x-axis represents time,
          the y-axis shows frequencies, and colors indicate intensity.
        </p>
      </InfoPanel>
      
      <div className="spectrogram-display-container">
        <div ref={spectrogramRef} className="spectrogram-display"></div>
      </div>
      
      <div className="spectrogram-config">
        <h4>Configure Spectrogram</h4>
        <div className="config-inputs">
          <div className="config-input">
            <label htmlFor="frequencyMin">Minimum Frequency (Hz):</label>
            <select
              id="frequencyMin"
              name="frequencyMin"
              value={config.frequencyMin}
              onChange={onConfigChange}
            >
              {frequencyMinOptions.map(option => (
                <option key={option} value={option}>
                  {option} Hz
                </option>
              ))}
            </select>
          </div>
          
          <div className="config-input">
            <label htmlFor="frequencyMax">Maximum Frequency (Hz):</label>
            <select
              id="frequencyMax"
              name="frequencyMax"
              value={config.frequencyMax}
              onChange={onConfigChange}
            >
              {frequencyMaxOptions.map(option => (
                <option key={option} value={option}>
                  {option} Hz
                </option>
              ))}
            </select>
          </div>
          
          <div className="config-input">
            <label htmlFor="fftSamples">FFT Size:</label>
            <select
              id="fftSamples"
              name="fftSamples"
              value={config.fftSamples}
              onChange={onConfigChange}
            >
              {fftSamplesOptions.map(option => (
                <option key={option} value={option}>
                  {option} {option >= 2048 ? "(higher quality)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          className="primary"
          onClick={onApplyChanges}
          disabled={!hasChanges}
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
} 