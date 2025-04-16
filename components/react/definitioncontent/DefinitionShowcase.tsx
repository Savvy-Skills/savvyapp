'use dom'
import React, { useState, useEffect } from 'react';
import './DefinitionShowcase.css';
import AudioTranscriptPlayer from './AudioTranscriptPlayer';

const audioUrl = "https://api.savvyskills.io/vault/JS-TssR_/BbOKIgRu5iVmO_n-b2COUMhbqoI/7bydmQ../perception.aac";
const timestampedTranscription = "https://api.savvyskills.io/vault/JS-TssR_/-yT2Hm3_6KmiEGbsbDE17Z5Nmf0/LtKcPg../timestamped_transcription.json";

const fetchTimestampedTranscription = async () => {
	const response = await fetch(timestampedTranscription);
	const data = await response.json();
	return data;
};

const DefinitionShowcase: React.FC = () => {
	const [currentTheme, setCurrentTheme] = useState('purple');
	const [timestampedTranscription, setTimestampedTranscription] = useState<any>(null);

	// Load the timestamped transcription
	useEffect(() => {
		// In a real app, you might fetch this from an API
		// For this example, we're using the one imported from the provided file
		// import('./timestamped_transcription.json')
		// 	.then(data => {
		// 		setTimestampedTranscription(data.default);
		// 	})
		// 	.catch(error => {
		// 		console.error("Failed to load transcription:", error);
		// 	});
		fetchTimestampedTranscription().then(data => {
			setTimestampedTranscription(data);
		});
	}, []);

	const themes = [
		{ id: 'purple', name: 'Purple' },
		{ id: 'cream', name: 'Cream' },
		{ id: 'lavender', name: 'Lavender' },
		{ id: 'orange', name: 'Orange' },
		{ id: 'blue', name: 'Blue' },
		{ id: 'cards-purple', name: 'Cards Purple' },
		{ id: 'cards-orange', name: 'Cards Orange' },
	];

	const sampleContent = `{{Perception}} is more than just {{sensing}}. It's the process of turning raw data into meaning. Humans and machines both do this, but in very different ways. A human sees a cat's shape, fur and movement. The {{brain}} processes the shapes and colors in the visual cortex.
Our {{brain}} uses memory and past experience to say, that's a cat. A machine sees the cat as a grid of tiny colored squares called {{pixels}}. It uses patterns it has learned from lots of other cat pictures to figure out. Based on training data, it makes a guess:
{{That looks}} like a cat.
Whether it's a person or a machine, perception is what turns simple signals into {{understanding}} and {{action}}.
`;

	return (
		<div className="showcase-container">
			<div className="theme-selector">
				<h3>Select Theme:</h3>
				<div className="theme-buttons">
					{themes.map(theme => (
						<button
							key={theme.id}
							className={`theme-button ${currentTheme === theme.id ? 'active' : ''}`}
							onClick={() => setCurrentTheme(theme.id)}
						>
							{theme.name}
						</button>
					))}
				</div>
			</div>


			<div className="definition-showcase">
				<AudioTranscriptPlayer
					audioUrl={audioUrl}
					timestampedTranscription={timestampedTranscription}
					definitionText={sampleContent}
					theme={currentTheme}
					title="What is perception?"
				/>
			</div>
		</div>
	);
};

export default DefinitionShowcase; 