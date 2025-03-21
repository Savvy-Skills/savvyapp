import { useState, useEffect, useCallback } from 'react';
import { useDataFetch } from './useDataFetch';
import { getWordToVecStore, WordToVecState } from '@/store/wordToVecStore';
import { useViewStore } from '@/store/viewStore';
import { DatasetInfo } from '@/types/index';

interface UseWordToVecProps {
	gameId: string;
	dataset_info: DatasetInfo;
}

export const useWordToVec = ({ gameId, dataset_info }: UseWordToVecProps) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const { currentSlideIndex, completeSlide } = useViewStore();
	
	// Get the Zustand store for this game instance
	const store = getWordToVecStore(gameId);
	
	// Use the store state and actions
	const {
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
	} : WordToVecState = store();
	
	const { error: datasetError, isLoading: datasetLoading, data } = useDataFetch({ source: currentDataset?.url, isCSV: true });
	
	// Initialize with the provided datasetInfo
	useEffect(() => {
		if (dataset_info && !currentDataset) {
			// setCurrentWord(data[0].word);
			setCurrentDataset(dataset_info);
		}
	}, [dataset_info, currentDataset, setCurrentWord, setCurrentDataset]);

	useEffect(() => {
		if (data && data.length > 0) {
			const nearestSimilarity = {
				word: data[1].word,
				similarity: data[1].similarity,
			};
			const tenthNearestSimilarity = {
				word: data[9].word,
				similarity: data[9].similarity,
			};
			const hundredthNearestSimilarity = {
				word: data[99].word,
				similarity: data[99].similarity,
			};
			const thousandthNearestSimilarity = {
				word: data[999].word,
				similarity: data[999].similarity,
			};
			setCurrentWord(data[0].word);
			setMetadata({ nearestSimilarity, tenthNearestSimilarity, hundredthNearestSimilarity, thousandthNearestSimilarity });
			setLoading(false);
		}
	}, [data, setMetadata, setLoading]);

	const guessWord = useCallback((word: string) => {
		word = word.toLowerCase();
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
	}, [data, addGuess, setGameStatus, setShowAnswer, completeSlide, currentSlideIndex]);

	const giveUp = useCallback(() => {
		setGameStatus('lost');
		setShowAnswer(true);	
		completeSlide(currentSlideIndex);
	}, [setGameStatus, setShowAnswer, completeSlide, currentSlideIndex]);

	const resetGame = useCallback(() => {
		storeResetGame();
		// Re-initialize with the current datasetInfo
		if (dataset_info) {
			setCurrentWord(dataset_info.name);
			setCurrentDataset(dataset_info);
		}
	}, [storeResetGame, dataset_info, setCurrentWord, setCurrentDataset]);

	const getWordHint = useCallback(() => {
		// TODO: Logic to get a random word hint from list of hints
		if (!currentDataset?.metadata.hints) {
			setCurrentWordHint("No hints available");
		} else {
			const randomWord = currentDataset?.metadata.hints[Math.floor(Math.random() * currentDataset?.metadata.hints.length)];
			setCurrentWordHint(randomWord);
		}
	}, [currentDataset, setCurrentWordHint]);

	return {
		currentWord,
		setCurrentWord,
		loading,
		error,
		guesses,
		gameStatus,
		currentWordHint,
		guessWord,
		giveUp,
		resetGame,
		getWordHint,
		showAnswer,
		metadata,
	};
};