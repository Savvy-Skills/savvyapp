import React, { useState, useRef, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import DefinitionComponent from './DefinitionComponent';
import './DefinitionShowcase.css';
import ExpandableFact from '../ui/ExpandableFact';

interface AudioTranscriptPlayerProps {
	audioUrl: string;
	definitionText: string;
	timestampedTranscription?: any;
	title?: string;
	theme?: string;
}

const AudioTranscriptPlayer: React.FC<AudioTranscriptPlayerProps> = ({
	audioUrl,
	definitionText,
	timestampedTranscription,
	title = 'Definition',
	theme = 'purple'
}) => {
	// Audio state moved up from AudioPlayer component
	const [isLoading, setIsLoading] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentAudioTime, setCurrentAudioTime] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null) as React.MutableRefObject<HTMLAudioElement | null>;
	const playAttemptRef = useRef(0);

	// Set up audio element on component mount
	useEffect(() => {
		const audio = new Audio(audioUrl);
		audioRef.current = audio;
		
		// Set up event listeners
		audio.addEventListener('loadedmetadata', () => {
			setIsLoading(false);
			setDuration(audio.duration);
		});
		
		audio.addEventListener('timeupdate', () => {
			setCurrentAudioTime(audio.currentTime);
		});
		
		audio.addEventListener('ended', () => {
			setIsPlaying(false);
		});
		
		audio.addEventListener('error', (e) => {
			const errorDetails = audio.error ? 
				`Code: ${audio.error.code}, Message: ${audio.error.message}` : 
				'Unknown error';
			console.error("Audio error:", errorDetails);
			setError(`Failed to load or play audio: ${errorDetails}`);
			setIsLoading(false);
		});
		
		audio.addEventListener('canplay', () => {
			setIsLoading(false);
		});
		
		// If metadata is already available (cached audio)
		if (audio.readyState >= 1) {
			setIsLoading(false);
			setDuration(audio.duration);
		}
		
		// Cleanup on unmount
		return () => {
			audio.pause();
			setIsPlaying(false);
			// Remove all event listeners
			audio.removeEventListener('loadedmetadata', () => {});
			audio.removeEventListener('timeupdate', () => {});
			audio.removeEventListener('ended', () => {});
			audio.removeEventListener('error', () => {});
			audio.removeEventListener('canplay', () => {});
		};
	}, [audioUrl]);

	// Audio control functions
	const togglePlayPause = () => {
		if (!audioRef.current) return;
		
		const audio = audioRef.current;
		
		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
		} else {
			playAttemptRef.current++;
			try {
				// Ensure audio is at the right position
				if (Math.abs(audio.currentTime - currentAudioTime) > 0.5) {
					audio.currentTime = currentAudioTime;
				}
				
				// Use an IIFE to handle async play
				(async () => {
					try {
						await audio.play();
						setIsPlaying(true);
					} catch (error) {
						console.error("Playback failed:", error);
						setError(`Playback failed: ${error}`);
						setIsPlaying(false);
					}
				})();
			} catch (e) {
				console.error("Play setup error:", e);
				setError(`Error playing audio: ${e}`);
				setIsPlaying(false);
			}
		}
	};

	const handleSeek = (newTime: number) => {
		if (!audioRef.current) return;
		
		try {
			audioRef.current.currentTime = newTime;
			setCurrentAudioTime(newTime);
		} catch (e) {
			console.error("Error seeking:", e);
		}
	};

	return (
		<div className="audio-transcript-container">
			<div className="highlight-transcript">
				<DefinitionComponent
					definitionText={definitionText}
					timestampedTranscription={timestampedTranscription}
					title={title}
					theme={theme}
					currentAudioTime={currentAudioTime}
				/>
			</div>
			{audioUrl && (
				<ExpandableFact
					title='Audio Transcript'
					emoji='🎧'
					color='var(--primary-color)'
				>
					<AudioPlayer
						isLoading={isLoading}
						isPlaying={isPlaying}
						duration={duration}
						currentTime={currentAudioTime}
						error={error}
						onTogglePlayPause={togglePlayPause}
						onSeek={handleSeek}
					/>
				</ExpandableFact>
			)}
		</div>
	);
};

export default AudioTranscriptPlayer; 