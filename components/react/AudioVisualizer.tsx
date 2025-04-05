'use dom'

import React, { useRef, useState, useEffect } from 'react';
import './AudioVisualizer.css';

interface SpectrogramConfig {
  fftSize: number;
  minFreq: number;
  maxFreq: number;
}

const AudioVisualizer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [spectrogramConfig, setSpectrogramConfig] = useState<SpectrogramConfig>({
    fftSize: 1024,
    minFreq: 0,
    maxFreq: 24000
  });
  
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Initialize AudioContext
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
    
    return () => {
      // Cleanup
      if (audioSource) {
        audioSource.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);
  
  useEffect(() => {
    if (audioBuffer) {
      drawWaveform();
      drawSpectrogram();
    }
  }, [audioBuffer]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setAudioFile(files[0]);
      loadAudioFile(files[0]);
    }
  };
  
  const loadAudioFile = (file: File) => {
    if (!audioContext) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result && audioContext) {
        try {
          const arrayBuffer = e.target.result as ArrayBuffer;
          const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
          setAudioBuffer(decodedBuffer);
        } catch (error) {
          console.error('Error decoding audio data:', error);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const drawWaveform = () => {
    if (!audioBuffer || !waveformCanvasRef.current) return;
    
    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get the audio data
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up drawing parameters
    const width = canvas.width;
    const height = canvas.height;
    
    // Calculate centering and scaling parameters
    const horizontalMargin = width * 0.1; // 10% margin on each side
    const drawingWidth = width - (horizontalMargin * 2);
    const step = Math.ceil(channelData.length / drawingWidth);
    const amp = height / 2;
    
    // Draw background
    ctx.fillStyle = '#1a1a1a'; // Dark gray background
    ctx.fillRect(0, 0, width, height);
    
    // Find max amplitude to auto-scale the waveform
    let maxAmp = 0;
    for (let i = 0; i < channelData.length; i++) {
      const absValue = Math.abs(channelData[i]);
      if (absValue > maxAmp) {
        maxAmp = absValue;
      }
    }
    
    // Auto-scale factor (0.8 to leave a little space at top and bottom)
    const scaleFactor = maxAmp > 0 ? 0.8 / maxAmp : 0.8;
    
    // Draw the waveform as filled area
    ctx.beginPath();
    ctx.moveTo(horizontalMargin, amp); // Start at the middle with margin
    
    // Draw top outline (left to right)
    for (let i = 0; i < drawingWidth; i++) {
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const dataIndex = Math.min(i * step + j, channelData.length - 1);
        const datum = channelData[dataIndex];
        if (datum > max) max = datum;
      }
      
      // Scale the amplitude and add to the x position with margin
      const x = horizontalMargin + i;
      const y = amp - (max * amp * scaleFactor);
      ctx.lineTo(x, y);
    }
    
    // Draw from right to left using min values
    for (let i = drawingWidth - 1; i >= 0; i--) {
      let min = 1.0;
      
      for (let j = 0; j < step; j++) {
        const dataIndex = Math.min(i * step + j, channelData.length - 1);
        const datum = channelData[dataIndex];
        if (datum < min) min = datum;
      }
      
      // Scale the amplitude and add to the x position with margin
      const x = horizontalMargin + i;
      const y = amp - (min * amp * scaleFactor);
      ctx.lineTo(x, y);
    }
    
    // Close the path
    ctx.closePath();
    
    // Fill with bright pink/magenta gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#ff00ff'); // Bright magenta
    gradient.addColorStop(0.5, '#e100e1'); // Slightly darker magenta
    gradient.addColorStop(1, '#ff00ff'); // Back to bright magenta
    ctx.fillStyle = gradient;
    ctx.fill();
  };
  
  const drawSpectrogram = () => {
    if (!audioBuffer || !spectrogramCanvasRef.current || !audioContext) return;
    
    const canvas = spectrogramCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dark navy background
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set up analyzer
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = spectrogramConfig.fftSize;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Calculate frequency range info
    const sampleRate = audioBuffer.sampleRate;
    const nyquist = sampleRate / 2;
    const minFreq = Math.max(0, Math.min(spectrogramConfig.minFreq, nyquist));
    const maxFreq = Math.min(nyquist, Math.max(spectrogramConfig.maxFreq, minFreq + 100));
    
    // Calculate bin ranges for the selected frequency range
    const binSize = nyquist / bufferLength;
    const minBin = Math.floor(minFreq / binSize);
    const maxBin = Math.min(bufferLength - 1, Math.ceil(maxFreq / binSize));
    const visibleBins = maxBin - minBin;
    
    // Draw frequency labels directly on canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    // Draw frequency markers and labels
    const labelCount = 5;
    for (let i = 0; i <= labelCount; i++) {
      const freq = minFreq + (maxFreq - minFreq) * (1 - i / labelCount);
      let label;
      
      if (freq >= 1000) {
        label = `${Math.round(freq / 100) / 10} kHz`;
      } else {
        label = `${Math.round(freq)} Hz`;
      }
      
      const y = (i / labelCount) * canvas.height;
      
      // Draw horizontal guides
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      
      // Draw frequency label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(label, 5, y + 12);
    }
    
    // Process one column at a time with updated frequency range
    const processColumn = (columnIndex: number, timeOffset: number) => {
      if (columnIndex >= canvas.width) return;
      
      // Create a new source node for each segment
      const tempOfflineCtx = new OfflineAudioContext(1, analyser.fftSize, audioBuffer!.sampleRate);
      const tempSource = tempOfflineCtx.createBufferSource();
      const tempAnalyser = tempOfflineCtx.createAnalyser();
      tempAnalyser.fftSize = analyser.fftSize;
      
      tempSource.buffer = audioBuffer;
      tempSource.connect(tempAnalyser);
      tempAnalyser.connect(tempOfflineCtx.destination);
      
      // Set the offset for this segment
      tempSource.start(0, timeOffset, analyser.fftSize / audioBuffer!.sampleRate);
      
      // Render this segment
      tempOfflineCtx.startRendering().then(renderedBuffer => {
        tempAnalyser.getByteFrequencyData(dataArray);
        
        // Draw the column with the specified frequency range
        for (let i = minBin; i < maxBin; i++) {
          const value = dataArray[i];
          const percent = value / 255;
          
          // Map the bin index to y position based on log scale
          const binIndex = i - minBin;
          const normPosition = binIndex / visibleBins;
          
          // Generate color based on the frequency intensity
          let color;
          if (percent < 0.2) {
            // Low intensity - dark blue to purple
            color = `rgb(${Math.floor(percent * 5 * 80)}, 0, ${Math.floor(40 + percent * 5 * 60)})`;
          } else if (percent < 0.5) {
            // Medium intensity - purple to orange/red
            const t = (percent - 0.2) / 0.3;
            color = `rgb(${Math.floor(80 + t * 175)}, ${Math.floor(t * 40)}, ${Math.floor(100 + t * 50)})`;
          } else {
            // High intensity - orange/red to yellow/white
            const t = (percent - 0.5) / 0.5;
            color = `rgb(${Math.floor(255)}, ${Math.floor(40 + t * 215)}, ${Math.floor(150 * t)})`;
          }
          ctx.fillStyle = color;
          
          // Draw the pixel
          const y = Math.floor((1 - normPosition) * canvas.height);
          const height = Math.ceil(canvas.height / visibleBins) + 1; // +1 to avoid gaps
          
          ctx.fillRect(columnIndex, y - height, 1, height);
        }
        
        // Process next column
        const timeStep = audioBuffer!.duration / canvas.width;
        processColumn(columnIndex + 1, timeOffset + timeStep);
      }).catch(err => {
        console.error('Rendering failed:', err);
      });
    };
    
    // Start processing from the beginning
    processColumn(0, 0);
  };
  
  const playAudio = () => {
    if (!audioBuffer || !audioContext) return;
    
    // Stop any currently playing audio
    if (audioSource && isPlaying) {
      audioSource.stop();
      setIsPlaying(false);
      return;
    }
    
    // Create a new source
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    // Set up callback for when playback ends
    source.onended = () => {
      setIsPlaying(false);
    };
    
    // Start playback
    source.start();
    setAudioSource(source);
    setIsPlaying(true);
  };
  
  // Add UI controls for spectrogram settings
  const handleFFTChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fftSize = parseInt(e.target.value);
    setSpectrogramConfig(prev => ({...prev, fftSize}));
  };
  
  const handleMinFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minFreq = parseInt(e.target.value);
    setSpectrogramConfig(prev => ({...prev, minFreq}));
  };
  
  const handleMaxFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxFreq = parseInt(e.target.value);
    setSpectrogramConfig(prev => ({...prev, maxFreq}));
  };
  
  return (
    <div className="audio-visualizer">
      <h2>Audio Visualizer</h2>
      
      <div className="upload-container">
        <input 
          type="file" 
          accept="audio/*" 
          onChange={handleFileChange} 
          className="file-input"
        />
        {audioFile && (
          <div className="file-info">
            <p>File: {audioFile.name}</p>
            <button 
              onClick={playAudio} 
              className="play-button"
            >
              {isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>
        )}
      </div>
      
      <div className="visualization-container">
        <div className="visualization-section">
          <h3>Waveform</h3>
          <canvas 
            ref={waveformCanvasRef} 
			style={{
				width: "100%",
			}}
            height={100} 
            className="waveform-canvas"
          />
        </div>
        
        <div className="visualization-section">
          <h3>Spectrogram</h3>
          <div className="spectrogram-controls">
            <div className="control-group">
              <label>FFT Size:</label>
              <select value={spectrogramConfig.fftSize} onChange={handleFFTChange}>
                <option value="512">512</option>
                <option value="1024">1024</option>
                <option value="2048">2048</option>
                <option value="4096">4096</option>
                <option value="8192">8192</option>
              </select>
            </div>
            <div className="control-group">
              <label>Min Freq (Hz):</label>
              <input 
                type="number" 
                min="0" 
                max="22000" 
                value={spectrogramConfig.minFreq} 
                onChange={handleMinFreqChange}
              />
            </div>
            <div className="control-group">
              <label>Max Freq (Hz):</label>
              <input 
                type="number" 
                min="0" 
                max="22050" 
                value={spectrogramConfig.maxFreq} 
                onChange={handleMaxFreqChange}
              />
            </div>
          </div>
          <canvas 
            ref={spectrogramCanvasRef}
			style={{
				width: "100%",
			}}
            height={100} 
            className="spectrogram-canvas"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer; 