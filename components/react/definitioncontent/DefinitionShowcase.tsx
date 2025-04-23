'use dom'
import React, { useState, useEffect } from 'react';
import './DefinitionShowcase.css';
import AudioTranscriptPlayer from './AudioTranscriptPlayer';
import { ContentInfo } from '@/types';


const fetchTimestampedTranscription = async (url: string) => {
	const response = await fetch(url);
	const data = await response.json();
	return data;
};

const DefinitionShowcase: React.FC<{ content: ContentInfo }> = ({ content }) => {
	const [currentTheme, setCurrentTheme] = useState(content.state.theme ?? 'purple');
	const [timestampedTranscription, setTimestampedTranscription] = useState<any>(null);

	useEffect(() => {
		if (content.state.timestampedTranscription) {
			fetchTimestampedTranscription(content.state.timestampedTranscription).then(data => {
				setTimestampedTranscription(data);
			});
		}
	}, []);



	return (
		<AudioTranscriptPlayer
			audioUrl={content.state.audioUrl}
			timestampedTranscription={timestampedTranscription}
			definitionText={content.state.value}
			theme={currentTheme}
			title={content.state.title}
		/>
	);
};

export default DefinitionShowcase; 