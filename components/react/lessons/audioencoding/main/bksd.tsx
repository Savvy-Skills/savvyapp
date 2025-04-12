'use dom'

import React, { useEffect, useRef, useState } from "react";
import StepCard from "../../../ui/StepCard";
import AudioSamplingVisualizer from "./steps/AudioSamplingVisualizer";
import ExpandableFact from "../../../ui/ExpandableFact";
import SpectrogramVisualizer from "./steps/SpectrogramVisualizer";
import { useAudioVisualizer } from "../hooks/useAudioVisualizer";
import "./AudioEncodingLesson.css";

const DEFAULT_LOCAL_SOUNDS = [
	{
		url: require("@/assets/sounds/dog-bark.mp3"),
		image: require("@/assets/images/pngs/dog.png"),
		title: "Dog Bark",
		description: "This is the first sound",
	},
	{
		url: require("@/assets/sounds/dog-barks.mp3"),
		image: require("@/assets/images/pngs/dogs.png"),
		title: "Dog Barks",
		description: "This is the second sound",
	},
	{
		url: require("@/assets/sounds/cat-meow.mp3"),
		image: require("@/assets/images/pngs/cat.png"),
		title: "Cat Meow",
		description: "This is the third sound",
	},
	{
		url: require("@/assets/sounds/cat-meows.mp3"),
		image: require("@/assets/images/pngs/cats.png"),
		title: "Cat Meows",
		description: "This is the fourth sound",
	},
];

const defaultConfig = {
	frequencyMin: 0,
	frequencyMax: 10000,
	fftSamples: 1024
};

export default function AudioEncodingLesson() {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [activeConfig, setActiveConfig] = useState(defaultConfig);
	const [localPlaying, setLocalPlaying] = useState(false);
	const [config, setConfig] = useState(defaultConfig);
	const [hasChanges, setHasChanges] = useState(false);
	const [configKey, setConfigKey] = useState(0);

	const waveformRef = useRef<HTMLDivElement>(null);
	const spectrogramRef = useRef<HTMLDivElement>(null);

	// Check if current config differs from active config
	useEffect(() => {
		const configChanged =
			config.frequencyMin !== activeConfig.frequencyMin ||
			config.frequencyMax !== activeConfig.frequencyMax ||
			config.fftSamples !== activeConfig.fftSamples;

		setHasChanges(configChanged);
	}, [config, activeConfig]);

	// Handle dropdown changes
	const handleConfigChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setConfig(prev => ({
			...prev,
			[name]: parseInt(value, 10)
		}));
	};

	// Apply configuration changes
	const applyChanges = () => {
		setActiveConfig(config);
		setHasChanges(false);
		setConfigKey(prev => prev + 1);
	};

	// Get audio source name for display
	const getAudioSourceName = () => {
		if (audioFile) return audioFile.name;
		if (audioUrl) {
			// Extract filename from URL or use a default name
			const urlParts = audioUrl.split('/');
			return urlParts[urlParts.length - 1] || 'Audio Track';
		}
		return '';
	};

	const { isPlaying, togglePlayPause, audioBuffer, peaks } = useAudioVisualizer({
		audioFile,
		audioUrl,
		waveformRef,
		spectrogramRef,
		onPlayPauseChange: setLocalPlaying,
		options: activeConfig
	});

	const handleAudioFileSelect = (file: File | null) => {
		// Clear both sources first
		setAudioUrl(null);
		setAudioFile(null);

		// Then set the new source after a short delay
		setTimeout(() => {
			setAudioFile(file);
		}, 50);
	};

	const handleAudioUrlSelect = (url: string | null) => {
		// If the selected URL is the same as current, do nothing
		if (url === audioUrl) return;

		// Clear both sources first
		setAudioUrl(null);
		setAudioFile(null);

		// Then set the new source immediately
		// No need for setTimeout, which can cause delays
		setAudioUrl(url);
	};

	const hasAudioSource = !!audioFile || !!audioUrl;

	return (
		<div className="audio-encoding-lesson">
			<h1 className="lesson-title">Audio Encoding</h1>
			<p className="lesson-description">
				Let's explore how computers "hear" sounds! This lesson shows how audio
				transforms into numbers that AI systems can understand and learn from.
			</p>

			<div className="lesson-content">
				{/* Step 1: Audio Input */}
				<StepCard
					stepNumber={1}
					title="Audio Input"
				>
					<p>
						Choose any audio you'd like to explore! While we hear sounds as
						continuous waves, computers need to learn how to "hear" them
						in their own special way.
					</p>

					<div className="audio-source-selector">
						<div className="option-section">
							<h3 className="option-title">Option 1: Sample Sounds</h3>
							<div className="sound-buttons">
								{DEFAULT_LOCAL_SOUNDS.map((sound, index) => {
									console.log({ sound })
									return (
										<div
											key={index}
											className={`sound-button ${audioUrl === sound.url ? 'active' : ''}`}
											onClick={() => handleAudioUrlSelect(sound.url)}
										>
											<img src={sound.image.uri} alt={sound.title} className="sound-image" />
											<div className="sound-name">{sound.title}</div>
										</div>
									)
								})}
							</div>
						</div>

						<div className="option-section">
							<h3 className="option-title">Option 2: Upload Audio</h3>
							<input
								type="file"
								id="audio-upload"
								accept="audio/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleAudioFileSelect(file);
								}}
								className="file-input-hidden"
							/>
							<button className="upload-button primary outline" onClick={() => document.getElementById('audio-upload')?.click()}>
								Pick Audio
							</button>
						</div>
					</div>

					<ExpandableFact
						title="Savvy Fact: Audio Encoding"
						emoji="🔊"
						color="#4a7dff"
					>
						<p>
							When you record sound, your microphone converts sound waves into electrical
							signals. These signals are then sampled thousands of times per second and
							converted into digital values that computers can process!
						</p>
					</ExpandableFact>
				</StepCard>

				{/* Only show the remaining steps if audio is selected */}
				{hasAudioSource && (
					<>
						{/* Step 2: Waveform Visualization */}
						<StepCard
							stepNumber={2}
							title="Waveform Visualization"
						>
							<p>
								The waveform below shows the changes in air pressure that create sound.
								When you speak or play music, you're creating pressure waves that travel
								through the air to your ears - and to microphones.
							</p>

							<div className="visualization-controls">
								<button
									onClick={togglePlayPause}
									className="primary"
								>
									{localPlaying ? 'Pause' : 'Play'}
								</button>
							</div>

							<div className="wave-visualization">
								<div ref={waveformRef} className="waveform-container" />
							</div>

							<ExpandableFact
								title="Sound Physics"
								emoji="🔊"
								color="#f97316"
							>
								<p>
									Sound waves are longitudinal pressure waves, meaning they compress and
									decompress in the same direction the wave travels. The height of the
									waveform (amplitude) corresponds to loudness, while the rate of
									oscillation (frequency) determines pitch.
								</p>
							</ExpandableFact>
						</StepCard>

						{/* Step 3: Audio Sampling */}
						<StepCard
							stepNumber={3}
							title="Audio Sampling"
						>
							<p>
								Computers don't process continuous audio waves directly. Instead, they take
								thousands of "snapshots" (samples) of the audio per second. This process
								converts continuous sound waves into discrete points that a computer can work with.
							</p>

							<AudioSamplingVisualizer
								peaks={peaks || []}
								audioBuffer={audioBuffer || undefined}
							/>

							<ExpandableFact
								title="Sampling Rate"
								emoji="⏱️"
								color="#14b8a6"
							>
								<p>
									Most digital audio is sampled at 44.1kHz (44,100 times per second) or 48kHz.
									This means we take 44,100 or 48,000 measurements of the sound wave every second!
									The Nyquist theorem tells us we need at least twice the sampling rate of the
									highest frequency we want to capture.
								</p>
							</ExpandableFact>
						</StepCard>

						{/* Step 4: Spectrogram */}
						<StepCard
							stepNumber={4}
							title="Frequency Analysis (Spectrogram)"
						>
							<p>
								A spectrogram shows how the frequencies in the audio change over time.
								This visualization is especially useful for AI audio processing because it
								reveals patterns that might not be visible in the waveform alone.
							</p>

							<SpectrogramVisualizer
								audioFile={audioFile}
								audioUrl={audioUrl}
								spectrogramRef={spectrogramRef}
								config={activeConfig}
								onConfigChange={handleConfigChange}
								onApplyChanges={applyChanges}
								hasChanges={hasChanges}
							/>

							<ExpandableFact
								title="AI and Spectrograms"
								emoji="🤖"
								color="#8b5cf6"
							>
								<p>
									Many AI models for speech recognition, music analysis, and audio classification
									use spectrograms as input. By analyzing the patterns of frequencies over time,
									AI can learn to identify spoken words, musical instruments, and other audio features.
								</p>
							</ExpandableFact>
						</StepCard>
					</>
				)}
			</div>
		</div>
	);
} 