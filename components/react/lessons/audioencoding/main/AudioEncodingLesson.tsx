'use dom'

import React, { useEffect, useRef, useState } from "react";
import StepCard from "../../../ui/StepCard";
import AudioSamplingVisualizer from "./steps/AudioSamplingVisualizer";
import ExpandableFact from "../../../ui/ExpandableFact";
import { useAudioVisualizer } from "../hooks/useAudioVisualizer";
import SpectrogramVisualizer from "./steps/SpectrogramVisualizer";
import { useWavesurfer } from '@wavesurfer/react'
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import "../../../index.css";
import "./AudioEncodingLesson.css";
import { ContentInfo } from "@/types";

const defaultConfig = {
	frequencyMin: 0,
	frequencyMax: 10000,
	fftSamples: 1024
};

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


export default function AudioEncodingLesson({ content }: { content?: ContentInfo }) {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [activeConfig, setActiveConfig] = useState(defaultConfig);
	const [localPlaying, setLocalPlaying] = useState(false);
	const [config, setConfig] = useState(defaultConfig);
	const [hasChanges, setHasChanges] = useState(false);
	const [_, setConfigKey] = useState(0);
	const [recordPlugin, setRecordPlugin] = useState<RecordPlugin | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [recordResult, setRecordResult] = useState<string | null>(null);
	const waveformRef = useRef<HTMLDivElement>(null);
	const micRef = useRef<HTMLDivElement>(null);
	const spectrogramRef = useRef<HTMLDivElement>(null);
	const [recordDuration, setRecordDuration] = useState(0);
	const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

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


	const { togglePlayPause, audioBuffer, peaks, resolvedAudioUrl } = useAudioVisualizer({
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

	const { wavesurfer } = useWavesurfer({
		container: micRef,
		waveColor: "rgb(200, 0, 200)",
		progressColor: "rgb(100, 0, 100)",
	})

	useEffect(() => {
		if (wavesurfer) {
			const recordPlugin = RecordPlugin.create({
				scrollingWaveform: false,
				continuousWaveform: true,
				continuousWaveformDuration: 30,
			});
			wavesurfer.registerPlugin(recordPlugin);
			recordPlugin.on('record-end', (blob) => {
				const url = URL.createObjectURL(blob);
				setAudioUrl(url);
				setRecordResult(url);

				// Clear the timer when recording stops
				if (recordingTimer) {
					clearInterval(recordingTimer);
					setRecordingTimer(null);
				}
				setRecordDuration(0);
			});
			setRecordPlugin(recordPlugin);
		}
	}, [wavesurfer]);

	const handleRecordAudio = () => {
		if (recordPlugin) {
			if (isRecording) {
				recordPlugin.stopRecording();

				// Clear the timer when recording stops
				if (recordingTimer) {
					clearInterval(recordingTimer);
					setRecordingTimer(null);
				}
				setRecordDuration(0);
			} else {
				recordPlugin.startRecording();

				// Start a timer to track recording duration
				const timer = setInterval(() => {
					setRecordDuration(prev => prev + 1);
				}, 1000);
				setRecordingTimer(timer);
			}
			setIsRecording(!isRecording);
		}
	};

	// Function to format seconds into MM:SS
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const hasAudioSource = !!resolvedAudioUrl;

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
						<div className="input-section">
							<p className="option-title">{content?.state.lessonMode === "advanced" ? "Option 1: Sample Sounds" : "Sample Sounds"}</p>
							<div className="card-buttons">
								{DEFAULT_LOCAL_SOUNDS.map((sound, index) => (
									<div
										key={index}
										className={`card-button ${audioUrl === sound.url ? 'active' : ''}`}
										onClick={() => handleAudioUrlSelect(sound.url)}
									>
										<img src={sound.image.uri} alt={sound.title} className="card-image" />
										<div className="card-name">{sound.title}</div>
										<button className="select-button">{audioUrl === sound.url ? 'Selected' : 'Select'}</button>
									</div>
								))}
							</div>
						</div>
						{content?.state.lessonMode === "advanced" && (
							<div className="input-section">
								<p className="option-title">Option 2: Record or Upload Audio</p>
								<div className="center-buttons">
									<div className="card-button" onClick={() => document.getElementById('audio-upload')?.click()}>
										<img src={require('@/assets/images/pngs/upload.png').uri} alt="Upload Audio" className="card-image" />
										<button className="select-button" onClick={() => document.getElementById('audio-upload')?.click()}>
											Upload Audio
										</button>
									</div>
									<div className="card-button" onClick={handleRecordAudio}>
										<img src={require('@/assets/images/pngs/mic.png').uri} alt="Upload Audio" className="card-image" />
										<button className="select-button">
											{isRecording ? (
												<>
													<span style={{ color: 'red' }}>🟥</span> Stop Recording
												</>
											) : (
												'Record Audio'
											)}
										</button>
										{isRecording && (
											<div className="recording-container">
												<div className="recording-progress">
													<p>Recording: {formatTime(recordDuration)}</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

					</div>

					<ExpandableFact
						title="Savvy Fact: Audio Encoding"
						emoji="🔊"
						color="var(--info-color)"
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
									{localPlaying ?
										<div className="play-button">
											<svg className="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
												<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6H8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 0h-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z" />
											</svg>

											<span className="play-button-text">Pause</span>
										</div> :
										<div className="play-button">
											<svg className="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
												<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 18V6l8 6-8 6Z" />
											</svg>

											<span className="play-button-text">Play</span>
										</div>
									}
								</button>
							</div>

							<div className="wave-visualization">
								<div ref={waveformRef} className="waveform-container" />
							</div>

							<ExpandableFact
								title="Sound Physics"
								emoji="🔊"
								color="var(--secondary-color)"
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
								color="var(--primary-color)"
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
			<div className="recording-indicator" ref={micRef} style={{ display: 'none' }} />
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
		</div>
	);
} 