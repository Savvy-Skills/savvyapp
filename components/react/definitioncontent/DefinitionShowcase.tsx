import React, { useState } from 'react';
import DefinitionComponent from './DefinitionComponent';
import './DefinitionShowcase.css';
import '../index.css';

const DefinitionShowcase: React.FC = () => {
	const [currentTheme, setCurrentTheme] = useState('purple');

	const themes = [
		{ id: 'purple', name: 'Purple' },
		{ id: 'cream', name: 'Cream' },
		{ id: 'lavender', name: 'Lavender' },
		{ id: 'orange', name: 'Orange' },
		{ id: 'blue', name: 'Blue' },
		{ id: 'cards-purple', name: 'Cards Purple' },
		{ id: 'cards-orange', name: 'Cards Orange' },
	];

	const sampleContent = `Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard {{dummy text ever since the 1500s}}, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. {{It was popularised in the 1960s}} with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

	return (
		<div className="showcase-container">
			<div className="theme-selector">
				<h3>Select Theme:</h3>
				<div className="theme-buttons">
					{themes.map(theme => (
						<button
							key={theme.id}
							className={`tab-button ${currentTheme === theme.id ? 'active' : ''}`}
							onClick={() => setCurrentTheme(theme.id)}
						>
							{theme.name}
						</button>
					))}
				</div>
			</div>

			<div className="definition-showcase">
				<DefinitionComponent
					title="Definition"
					content={sampleContent.concat(sampleContent)}
					theme={currentTheme}
				/>
			</div>
		</div>
	);
};

export default DefinitionShowcase; 