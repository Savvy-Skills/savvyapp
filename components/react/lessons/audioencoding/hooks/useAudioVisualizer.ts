import { useState, useEffect, RefObject, useRef, useMemo } from "react";
import WaveSurfer from "wavesurfer.js";
//@ts-ignore
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
//@ts-ignore
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

interface UseAudioVisualizerProps {
	audioFile?: File | null;
	audioUrl?: string | null;
	waveformRef: RefObject<HTMLDivElement | null>;
	spectrogramRef: RefObject<HTMLDivElement | null>;
	onPlayPauseChange?: (isPlaying: boolean) => void;
	options?: {
		waveColor?: string;
		progressColor?: string;
		frequencyMin?: number;
		frequencyMax?: number;
		fftSamples?: number;
	};
}

function createTimelinePlugin(duration: number) {
	console.log({duration});
	const primaryLabelInterval = duration < 10 ? 0.5 : duration < 20 ? 1 : 5;
	const secondaryLabelInterval = primaryLabelInterval;
	const timeInterval = duration < 10 ? 0.1 : duration < 20 ? 0.5 : 1;

	return TimelinePlugin.create({
		height: 20,
		style: { color: "black" },
		primaryLabelInterval,
		secondaryLabelInterval,
		timeInterval,
	});
}

export function useAudioVisualizer({
	audioFile,
	audioUrl,
	waveformRef,
	spectrogramRef,
	onPlayPauseChange,
	options = {}
}: UseAudioVisualizerProps) {
	// State for WaveSurfer instance
	const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
	const [micWavesurfer, setMicWavesurfer] = useState<WaveSurfer | null>(null);
	// Keep track of plugins separately to handle cleanup correctly
	const pluginsRef = useRef<{
		spectrogram: any | null;
		timeline: any | null;
		record: any | null;
	}>({
		spectrogram: null,
		timeline: null,
		record: null
	});

	const [isPlaying, setIsPlaying] = useState(false);
	const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | null>(null);
	const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
	const [peaks, setPeaks] = useState<number[][] | null>(null);
	const [isRecording, setIsRecording] = useState(false);

	// Track current audio sources with a ref to avoid race conditions
	const currentAudioSource = useRef<{ file?: File | null, url?: string | null }>({
		file: null,
		url: null
	});

	// Memoize options to prevent unnecessary effect triggers
	const memoizedOptions = useMemo(() => {
		const {
			waveColor = "rgb(200, 0, 200)",
			progressColor = "rgb(100, 0, 100)",
			frequencyMin = 0,
			frequencyMax = 10000,
			fftSamples = 1024
		} = options;

		return {
			waveColor,
			progressColor,
			frequencyMin,
			frequencyMax,
			fftSamples
		};
	}, [options.waveColor, options.progressColor, options.frequencyMin, options.frequencyMax, options.fftSamples]);


	// Update audio source immediately when props change
	useEffect(() => {
		const sourceChanged =
			currentAudioSource.current.file !== audioFile ||
			currentAudioSource.current.url !== audioUrl;

		if (sourceChanged) {
			// Update current source reference immediately
			currentAudioSource.current = {
				file: audioFile,
				url: audioUrl
			};

			// Clean up existing wavesurfer instance 
			if (wavesurfer) {
				try {
					if (wavesurfer.isPlaying()) {
						wavesurfer.pause();
					}
					wavesurfer.unAll();
					wavesurfer.destroy();
					setWavesurfer(null);
				} catch (error) {
					console.error("Error destroying wavesurfer:", error);
				}
			}

			// Clear audio state when source changes
			setAudioBuffer(null);
			setPeaks(null);

			// Clear the DOM elements
			if (waveformRef.current) {
				waveformRef.current.innerHTML = '';
			}
			if (spectrogramRef.current) {
				spectrogramRef.current.innerHTML = '';
			}
		}
	}, [audioFile, audioUrl, wavesurfer]);

	// Handle resolving the audio URL (file object → URL or direct URL)
	useEffect(() => {
		if (audioFile) {
			// Create blob URL from file
			const url = URL.createObjectURL(audioFile);
			setResolvedAudioUrl(url);

			// Clean up function
			return () => {
				URL.revokeObjectURL(url);
			};
		} else if (audioUrl) {
			// Use the provided URL directly
			setResolvedAudioUrl(audioUrl);
		} else {
			setResolvedAudioUrl(null);
		}
	}, [audioFile, audioUrl]);

	// Initialize WaveSurfer when we have a resolved URL
	useEffect(() => {
		if (!resolvedAudioUrl || (!waveformRef.current && !spectrogramRef.current)) {
			return;
		}

		// Create new WaveSurfer instance
		let ws: WaveSurfer | null = null;

		try {
			// Only create WaveSurfer instance if we have a waveform container
			if (waveformRef.current) {
				ws = WaveSurfer.create({
					container: waveformRef.current,
					waveColor: memoizedOptions.waveColor,
					progressColor: memoizedOptions.progressColor,
					backend: "WebAudio",
					normalize: true,
					height: 120,
					barWidth: 2,
					barGap: 1,
				});
			} else {
				// If no waveform container, create a hidden instance for processing
				const tempContainer = document.createElement('div');
				tempContainer.style.display = 'none';
				document.body.appendChild(tempContainer);

				ws = WaveSurfer.create({
					container: tempContainer,
					backend: "WebAudio",
					normalize: true,
				});
			}

			// Only add spectrogram if we have a spectrogram container
			if (spectrogramRef.current && ws) {
				try {
					// First clear the container
					spectrogramRef.current.innerHTML = '';

					// Create the plugin
					const spectrogramPlugin = SpectrogramPlugin.create({
						container: spectrogramRef.current,
						labels: true,
						frequencyMin: memoizedOptions.frequencyMin,
						frequencyMax: memoizedOptions.frequencyMax,
						fftSamples: memoizedOptions.fftSamples,
						height: 200,
					});

					// Register it with WaveSurfer
					ws.registerPlugin(spectrogramPlugin);

					// Store reference for cleanup
					pluginsRef.current.spectrogram = spectrogramPlugin;
				} catch (error) {
					console.error("Error creating spectrogram plugin:", error);
				}
			}

			// Add timeline if we have a waveform container
			if (waveformRef.current && ws) {
				// ws.registerPlugin(timelinePlugin);
				// pluginsRef.current.timeline = timelinePlugin;
			}

			// Set up event listeners
			ws.on('play', () => {
				setIsPlaying(true);
				onPlayPauseChange?.(true);
			});

			ws.on('pause', () => {
				setIsPlaying(false);
				onPlayPauseChange?.(false);
			});

			ws.on('finish', () => {
				setIsPlaying(false);
				onPlayPauseChange?.(false);
			});

			ws.on('ready', () => {
				if (ws) {
					// Extract data for visualizations
					pluginsRef.current.timeline = createTimelinePlugin(ws.getDuration());
					ws.registerPlugin(pluginsRef.current.timeline);
					setAudioBuffer(ws.getDecodedData());
					setPeaks(ws.exportPeaks());
				}
			});

			// Load audio
			ws.load(resolvedAudioUrl);
			setWavesurfer(ws);
		} catch (error) {
			console.error("Error initializing wavesurfer:", error);
		}

		// Return cleanup function
		return () => {
			try {
				// Clear the container first
				if (spectrogramRef.current) {
					spectrogramRef.current.innerHTML = '';
				}

				// Clear plugin references
				pluginsRef.current.spectrogram = null;

				// Handle wavesurfer cleanup in a separate try block
				if (ws) {
					try {
						// First pause if playing
						if (ws.isPlaying()) {
							ws.pause();
						}

						// Then try to unregister events
						ws.unAll();

						// At the end, try to destroy - and silence any errors
						setTimeout(() => {
							try {
								ws.destroy();
							} catch (_) {
								// Silently ignore errors during destroy
							}
						}, 0);
					} catch (e) {
						// Silently ignore any errors
					}
				}
			} catch (error) {
				console.error("Error during cleanup:", error);
			}
		};
	}, [resolvedAudioUrl, memoizedOptions]);

	// Toggle play/pause
	const togglePlayPause = () => {
		if (wavesurfer) {
			wavesurfer.playPause();
		}
	};


	return {
		isPlaying,
		isRecording,
		togglePlayPause,
		wavesurfer,
		audioBuffer,
		peaks,
		resolvedAudioUrl
	};
} 