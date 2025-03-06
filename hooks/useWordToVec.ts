import { useState, useEffect, useCallback } from 'react';
import { getWordVecDatasets } from '../services/datasetsAPI';
import { useDataFetch } from './useDataFetch';
import { getWordToVecStore } from '../stores/wordToVecStore';
import { useViewStore } from '@/store/viewStore';

interface UseWordToVecProps {
	gameId: string;
}

export const useWordToVec = ({ gameId }: UseWordToVecProps) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const { currentSlideIndex, completeSlide } = useViewStore();
	
	// Get the Zustand store for this game instance
	const store = getWordToVecStore(gameId);
	
	// Use the store state and actions
	const {
		datasets,
		currentWord,
		currentDataset,
		guesses,
		gameStatus,
		currentWordHint,
		showAnswer,
		metadata,
		setCurrentWord,
		setCurrentDataset,
		addGuess,
		setGameStatus,
		setCurrentWordHint,
		setShowAnswer,
		setMetadata,
		resetGame: storeResetGame,
		setDatasets
	} = store();
	
	const { error: datasetsError, isLoading: datasetsLoading, data } = useDataFetch({ source: currentDataset?.url, isCSV: true });
	
	useEffect(() => {
		const fetchDatasets = async () => {
			try {
				setLoading(true);
				const fetchedDatasets = await getWordVecDatasets();
				setDatasets(fetchedDatasets);
				// Set a random word from the dataset as the initial current word if not already set
				if (fetchedDatasets.length > 0 && !currentWord) {
					const randomIndex = Math.floor(Math.random() * fetchedDatasets.length);
					setCurrentWord(fetchedDatasets[randomIndex].name);
					setCurrentDataset(fetchedDatasets[randomIndex]);
				}
			} catch (err) {
				setError('Failed to fetch word2vec datasets');
				setLoading(false);
				console.error(err);
			}
		};
		if (datasets.length === 0) {
			fetchDatasets();
		}
	}, [currentWord, setCurrentWord, setCurrentDataset, setDatasets, datasets]);

	useEffect(() => {
		if (datasetsError) {
			setError(datasetsError);
		}
	}, [datasetsError]);

	useEffect(() => {
		setLoading(datasetsLoading);
	}, [datasetsLoading]);

	useEffect(() => {
		if (data && data.length > 0) {
			const nearestSimilarity = data[1].similarity;
			const tenthNearestSimilarity = data[9].similarity;
			const hundredthNearestSimilarity = data[99].similarity;
			const thousandthNearestSimilarity = data[999].similarity;
			setMetadata({ nearestSimilarity, tenthNearestSimilarity, hundredthNearestSimilarity, thousandthNearestSimilarity });
		}
	}, [data, setMetadata]);

	const guessWord = useCallback((word: string) => {
		// Find the word in the dataset
		const wordIndex = data?.findIndex(row => row.word === word);
		if (wordIndex !== -1) {
			const similarity = data[wordIndex].similarity;
			if (similarity === 1) {
				addGuess({ word, similarity });
				setGameStatus('won');
				setShowAnswer(true);
				completeSlide(currentSlideIndex);
			} else {
				addGuess({ word, similarity });
			}
		} else {
			addGuess({ word, similarity: 0 });
		}
	}, [data, addGuess, setGameStatus, setShowAnswer]);

	const giveUp = useCallback(() => {
		setGameStatus('lost');
		setShowAnswer(true);
	}, [setGameStatus, setShowAnswer]);

	const resetGame = useCallback(() => {
		storeResetGame();
	}, [storeResetGame]);

	const startGame = useCallback(() => {
		// Reset the game
		resetGame();
		// Pick a random word from the dataset of datasets
		const randomIndex = Math.floor(Math.random() * datasets.length);
		setCurrentWord(datasets[randomIndex].name);
		setCurrentDataset(datasets[randomIndex]);
	}, [datasets, setCurrentWord, setCurrentDataset]);

	const getWordHint = useCallback(() => {
		// TODO: Logic to get a random word hint from list of hints
		console.log({currentDataset});
		if (!currentDataset?.metadata.hints) {
			setCurrentWordHint("No hints available");
		} else {
			const randomWord = currentDataset?.metadata.hints[Math.floor(Math.random() * currentDataset?.metadata.hints.length)];
			setCurrentWordHint(randomWord);
		}
	}, [currentDataset, setCurrentWordHint]);

	return {
		datasets,
		currentWord,
		setCurrentWord,
		loading,
		error,
		guesses,
		gameStatus,
		currentWordHint,
		guessWord,
		giveUp,
		startGame,
		getWordHint,
		showAnswer,
		metadata,
	};
};