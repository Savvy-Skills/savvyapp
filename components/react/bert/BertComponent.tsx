'use dom'

import { useState, useCallback, useMemo, memo } from "react";
import ExpandableFact from "../ui/ExpandableFact";
import StepCard from "../ui/StepCard";
import "./BertComponent.css";
// Define types for our prediction results
interface BertPrediction {
	token_str: string;
	score: number;
}

// Add this new interface for explanations
interface SentenceExplanation {
	correctAnswer: string;
	explanation: string;
}

// Memoized component for prediction buttons
const PredictionButton = memo(({ 
	prediction, 
	onSelect 
}: { 
	prediction: BertPrediction, 
	onSelect: (word: string) => void 
}) => (
	<button
		className="primary outline hoverable"
		onClick={() => onSelect(prediction.token_str)}
	>
		{prediction.token_str} ({(prediction.score * 100).toFixed(1)}%)
	</button>
));

// Memoized component for the masked sentence
const MaskedSentence = memo(({ 
	sentence, 
	selectedWord, 
	onMaskClick 
}: { 
	sentence: string, 
	selectedWord: string | null, 
	onMaskClick: () => void 
}) => {
	const parts = sentence.split("[MASK]");
	
	return (
		<div className="masked-sentence">
			{parts[0]}
			<button
				onClick={onMaskClick}
				className="masked-word-button"
			>
				{selectedWord || "[ Click to guess ]"}
			</button>
			{parts[1]}
		</div>
	);
});

export default function BertMaskedGame() {
	const [sentenceIndex, setSentenceIndex] = useState(0);
	const [results, setResults] = useState<BertPrediction[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedWord, setSelectedWord] = useState<string | null>(null);
	const [showExplanation, setShowExplanation] = useState(false);

	const exampleSentences = [
		"The [MASK] of Japan is Tokyo.",
		"The [MASK] of a story tells what happened.",
		"Plants use [MASK] to perform photosynthesis during the day.",
		"To be or not to [MASK], that is the famous question.",
		"A dog is a type of [MASK] commonly kept as a pet."
	];

	// Add explanations for each sentence
	const sentenceExplanations: SentenceExplanation[] = [
		{
			correctAnswer: "capital",
			explanation: "BERT correctly predicts 'capital' with high confidence (99.8%). This shows BERT has learned factual knowledge about countries and their capitals through its training on a large text corpus."
		},
		{
			correctAnswer: "end",
			explanation: "BERT predicts 'end' as most likely (29.6%). This makes sense because 'the end of a story' is a common phrase, though 'beginning', 'plot', or 'moral' might also be reasonable answers."
		},
		{
			correctAnswer: "sunlight",
			explanation: "BERT correctly predicts 'sunlight' (50.0%). This demonstrates BERT's ability to learn scientific concepts during pre-training, connecting plants with photosynthesis and sunlight."
		},
		{
			correctAnswer: "be",
			explanation: "BERT predicts 'be' with 98.2% confidence. This shows BERT recognizes famous quotations and understands their structure - it has definitely seen Shakespeare's famous line during training!"
		},
		{
			correctAnswer: "animal",
			explanation: "BERT predicts 'dog' with 70.4% confidence, while 'animal' is at 25.7%. This is an interesting case where BERT makes a reasonable but incorrect prediction. The model is likely influenced by the pattern 'X is a type of X' which is common in definitions, rather than recognizing the hierarchical relationship between dogs and animals."
		}
	];

	const sentence = exampleSentences[sentenceIndex];

	const handleMaskClick = useCallback(async () => {
		setLoading(true);
		setResults([]);

		try {
			const response = await fetch("https://api-inference.huggingface.co/models/bert-base-uncased", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
				body: JSON.stringify({ inputs: sentence }),
			});

			const predictions = await response.json();
			setResults(predictions);
		} catch (error) {
			console.error("Error fetching predictions:", error);
		} finally {
			setLoading(false);
		}
	}, [sentence]);

	// Add a function to handle word selection with explanation
	const handleWordSelect = useCallback((word: string) => {
		setSelectedWord(word);
		setShowExplanation(true);
	}, []);

	const handlePrevSentence = useCallback(() => {
		setSentenceIndex((i) => Math.max(0, i - 1));
		setResults([]);
		setSelectedWord(null);
		setShowExplanation(false);
	}, []);

	const handleNextSentence = useCallback(() => {
		setSentenceIndex((i) => Math.min(exampleSentences.length - 1, i + 1));
		setResults([]);
		setSelectedWord(null);
		setShowExplanation(false);
	}, [exampleSentences.length]);

	// Memoize the predictions section
	const predictionsSection = useMemo(() => {
		if (loading || results.length === 0) return null;
		
		return (
			<div className="predictions-section">
				<h2 className="predictions-title">Choose the correct word:</h2>
				<div className="predictions-list">
					{results.map((res, idx) => (
						<PredictionButton 
							key={idx} 
							prediction={res} 
							onSelect={handleWordSelect} 
						/>
					))}
				</div>
			</div>
		);
	}, [results, loading, handleWordSelect]);

	// Add explanation section to the component 
	const explanationSection = useMemo(() => {
		if (!showExplanation) return null;
		
		const explanation = sentenceExplanations[sentenceIndex];
		const isCorrectAnswer = selectedWord === explanation.correctAnswer;
		
		return (
			<div className="prediction-explanation">
				<h3>{isCorrectAnswer ? "Correct! 🎉" : "Let's understand BERT's prediction:"}</h3>
				<p>{explanation.explanation}</p>
			</div>
		);
	}, [showExplanation, sentenceIndex, selectedWord, sentenceExplanations]);

	// Update loading indicator
	const loadingIndicator = loading ? (
		<div className="loading-predictions">Loading predictions</div>
	) : null;

	return (
		<div className="lesson-container">
			<h1 className="lesson-title">🔍 BERT Word Guessing Game</h1>
			<StepCard 
				stepNumber={1} 
				title="Fill in the Blank with BERT"
				stepNumberStyle={{ whiteSpace: 'nowrap', minWidth: '60px', flexShrink: 0 }}
				titleStyle={{ flexGrow: 1, hyphens: 'auto', overflowWrap: 'break-word' }}
			>
				<p>
					BERT is a language model that can predict missing words in a sentence. 
					Click on the masked word to see BERT's predictions for the blank space.
				</p>
				
				<div className="masked-sentence">
					<MaskedSentence 
						sentence={sentence}
						selectedWord={selectedWord}
						onMaskClick={handleMaskClick}
					/>
				</div>

				<div className="nav-buttons">
					<button
						className="secondary hoverable"
						onClick={handlePrevSentence}
						disabled={sentenceIndex === 0}
					>
						⬅ Previous
					</button>
					<button
						className="secondary hoverable"
						onClick={handleNextSentence}
						disabled={sentenceIndex === exampleSentences.length - 1}
					>
						Next ➡
					</button>
				</div>

				{loadingIndicator}
				{predictionsSection}
				{explanationSection}

				<ExpandableFact
					title="How BERT Predicts Words"
					emoji="🧠"
					color="var(--info-color)"
				>
					<p>
						BERT (Bidirectional Encoder Representations from Transformers) analyzes the context on both sides 
						of a missing word, not just the words that come before it. This bidirectional approach helps BERT 
						understand sentence meaning better than earlier models that only looked at previous words.
					</p>
				</ExpandableFact>
			</StepCard>
		</div>
	);
}

