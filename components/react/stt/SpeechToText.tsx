import React, { useState, useEffect, useRef } from 'react';
import * as Vosk from 'vosk-browser';
import './SpeechToText.css';
import StepCard from '../ui/StepCard';
import ExpandableFact from '../ui/ExpandableFact';
import '../index.css';

interface SpeechToTextProps {
	onTextChange?: (text: string) => void;
	placeholder?: string;
	modelPath?: string;
}

const MicSvg = () => {
	return (
		<svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
			<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9v3a5.006 5.006 0 0 1-5 5h-4a5.006 5.006 0 0 1-5-5V9m7 9v3m-3 0h6M11 3h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
		</svg>
	)
}

const StopMicSvg = () => {
	return (
		<svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
			<path fill="currentColor" d="M19.97 9.012a1 1 0 1 0-2 0h2Zm-1 2.988 1 .001V12h-1Zm-8.962 4.98-.001 1h.001v-1Zm-3.52-1.46.708-.708-.707.707ZM5.029 12h-1v.001l1-.001Zm3.984 7.963a1 1 0 1 0 0 2v-2Zm5.975 2a1 1 0 0 0 0-2v2ZM7.017 8.017a1 1 0 1 0 2 0h-2Zm6.641 4.862a1 1 0 1 0 .667 1.886l-.667-1.886Zm-7.63-2.87a1 1 0 1 0-2 0h2Zm9.953 5.435a1 1 0 1 0 1 1.731l-1-1.731ZM12 16.979h1a1 1 0 0 0-1-1v1ZM5.736 4.322a1 1 0 0 0-1.414 1.414l1.414-1.414Zm12.528 15.356a1 1 0 0 0 1.414-1.414l-1.414 1.414ZM17.97 9.012V12h2V9.012h-2Zm0 2.987a3.985 3.985 0 0 1-1.168 2.813l1.415 1.414a5.985 5.985 0 0 0 1.753-4.225l-2-.002Zm-7.962 3.98a3.985 3.985 0 0 1-2.813-1.167l-1.414 1.414a5.985 5.985 0 0 0 4.225 1.753l.002-2Zm-2.813-1.167a3.985 3.985 0 0 1-1.167-2.813l-2 .002a5.985 5.985 0 0 0 1.753 4.225l1.414-1.414Zm3.808-10.775h1.992v-2h-1.992v2Zm1.992 0c1.097 0 1.987.89 1.987 1.988h2a3.988 3.988 0 0 0-3.987-3.988v2Zm1.987 1.988v4.98h2v-4.98h-2Zm-5.967 0c0-1.098.89-1.988 1.988-1.988v-2a3.988 3.988 0 0 0-3.988 3.988h2Zm-.004 15.938H12v-2H9.012v2Zm2.988 0h2.987v-2H12v2ZM9.016 8.017V6.025h-2v1.992h2Zm5.967 2.987a1.99 1.99 0 0 1-1.325 1.875l.667 1.886a3.989 3.989 0 0 0 2.658-3.76h-2ZM6.03 12v-1.992h-2V12h2Zm10.774 2.812a3.92 3.92 0 0 1-.823.632l1.002 1.731a5.982 5.982 0 0 0 1.236-.949l-1.415-1.414ZM4.322 5.736l13.942 13.942 1.414-1.414L5.736 4.322 4.322 5.736ZM12 15.98h-1.992v2H12v-2Zm-1 1v3.984h2V16.98h-2Z" />
		</svg>
	)
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
	onTextChange,
	placeholder = 'Recognized speech will appear here...',
	modelPath = 'model.tar.gz'
}) => {
	const [text, setText] = useState('');
	const [partialResult, setPartialResult] = useState('');
	const [isRecording, setIsRecording] = useState(false);
	const [isModelLoaded, setIsModelLoaded] = useState(false);

	const recognizerRef = useRef<any>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const path = `https://api.savvyskills.io/vault/JS-TssR_/bwYQaXstlp_eXobmLwIqMOCNErk/TOSJEw../vosk-model-small-en-us-0.15.tar.gz`;

	// Initialize the model on component mount
	useEffect(() => {
		let isMounted = true;

		const loadModel = async () => {
			try {
				const model = await Vosk.createModel(path);
				if (isMounted) {
					recognizerRef.current = new model.KaldiRecognizer(16000);
					setIsModelLoaded(true);

					// Set up event listeners
					recognizerRef.current.on("result", (message: any) => {
						const newText = message.result.text;
						setText(prevText => {
							const updatedText = prevText ? `${prevText} ${newText}` : newText;
							if (onTextChange) onTextChange(updatedText);
							return updatedText;
						});
						setPartialResult('');
					});

					recognizerRef.current.on("partialresult", (message: any) => {
						const partial = message.result.partial;
						if (partial) {
							setPartialResult(partial);
						}
					});
				}
			} catch (error) {
				console.error('Failed to load speech recognition model:', error);
			}
		};

		loadModel();

		return () => {
			isMounted = false;
		};
	}, [modelPath, onTextChange]);

	// Clean up resources when component unmounts
	useEffect(() => {
		return () => {
			stopRecording();
		};
	}, []);

	const startRecording = async () => {
		if (!isModelLoaded) {
			console.error('Speech recognition model not loaded yet');
			return;
		}

		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: false,
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					channelCount: 1,
					sampleRate: 16000
				},
			});

			streamRef.current = mediaStream;
			audioContextRef.current = new AudioContext();
			processorNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

			processorNodeRef.current.onaudioprocess = (event) => {
				try {
					if (recognizerRef.current) {
						recognizerRef.current.acceptWaveform(event.inputBuffer);
					}
				} catch (error) {
					console.error('acceptWaveform failed', error);
				}
			};

			const source = audioContextRef.current.createMediaStreamSource(mediaStream);
			source.connect(processorNodeRef.current);
			processorNodeRef.current.connect(audioContextRef.current.destination);

			setIsRecording(true);
		} catch (error) {
			console.error('Failed to start recording:', error);
		}
	};

	const stopRecording = () => {
		if (processorNodeRef.current && audioContextRef.current) {
			processorNodeRef.current.disconnect();
			processorNodeRef.current = null;
		}

		if (audioContextRef.current) {
			audioContextRef.current.close().catch(console.error);
			audioContextRef.current = null;
		}

		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop());
			streamRef.current = null;
		}

		setIsRecording(false);
		setPartialResult('');
	};

	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value;
		setText(newText);
		if (onTextChange) onTextChange(newText);
	};

	const getPartialResultStyles = () => {
		// Calculate extra padding based on text length
		const basePadding = 0.75; // rem
		const extraPadding = text ? text.length * 0.1 : 0; // adjust multiplier as needed
		
		return {
			paddingLeft: `${basePadding + extraPadding}rem`
		};
	};

	return (
		<div className="lesson-container">
			<h1 className="lesson-title">Explore How Computers Recognize Speech</h1>
			
			<StepCard 
				stepNumber={1} 
				title="Speech to Text Recognition"
				stepNumberStyle={{ whiteSpace: 'nowrap', minWidth: '60px', flexShrink: 0 }}
				titleStyle={{ flexGrow: 1, hyphens: 'auto', overflowWrap: 'break-word' }}
			>
				<p>
					Computers can convert spoken language into text by analyzing audio patterns.
					Try speaking into your microphone and see how well the computer recognizes your words.
				</p>
				
				<div className="nextword-input-container">
					<div className="nextword-textarea-container">
						<textarea
							ref={textareaRef}
							value={text}
							onChange={handleInputChange}
							placeholder={placeholder}
							className="nextword-textarea"
							rows={3}
						/>
						
						{isRecording && partialResult && (
							<div className="nextword-partial-result-container">
								<div className="nextword-partial-result-label">Listening:</div>
								<div className="nextword-partial-result">
									{partialResult}
								</div>
							</div>
						)}
					</div>
					
					<div className="nextword-button-container">
						<button
							onClick={toggleRecording}
							className={`nextword-button primary full-width ${isRecording ? 'recording' : ''}`}
							disabled={!isModelLoaded}
							title={isRecording ? 'Stop recording' : 'Start recording'}
						>
							{isRecording ? 
								<>
									<StopMicSvg /> Stop Recording
								</> : 
								<>
									<MicSvg /> Start Recording
								</>
							}
						</button>
					</div>
				</div>
				
				{!isModelLoaded && (
					<div className="nextword-predictions">
						<p className="nextword-loading">Loading speech recognition model...</p>
					</div>
				)}
				
				<ExpandableFact
					title="How Speech Recognition Works"
					emoji="🎤"
					color="var(--info-color)"
				>
					<p>
						Speech recognition technology converts spoken language into text by analyzing 
						sound patterns. The system breaks down audio into small pieces, compares them 
						to known sound patterns, and predicts the most likely words based on both sounds 
						and language context.
					</p>
				</ExpandableFact>
			</StepCard>
		</div>
	);
};

export default SpeechToText;
