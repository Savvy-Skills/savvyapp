import { create } from 'zustand';
// Remove persist import since we won't use it
// import { persist, createJSONStorage } from 'zustand/middleware';
import { DatasetInfo } from '../types';

type Guess = {
  word: string;
  similarity: number | null;
};

type Metadata = {
  nearestSimilarity: {
    word: string;
    similarity: number;
  };
  tenthNearestSimilarity: {
    word: string;
    similarity: number;
  };
  hundredthNearestSimilarity: {
    word: string;
    similarity: number;
  };
  thousandthNearestSimilarity: {
    word: string;
    similarity: number;
  };
};

export interface WordToVecState {
  currentWord: string;
  currentDataset: DatasetInfo | null;
  guesses: Guess[];
  gameStatus: 'playing' | 'won' | 'lost';
  currentWordHint: string;
  showAnswer: boolean;
  metadata: Metadata;
  
  // Actions
  setCurrentWord: (word: string) => void;
  setCurrentDataset: (dataset: DatasetInfo | null) => void;
  addGuess: (guess: Guess) => void;
  setGameStatus: (status: 'playing' | 'won' | 'lost') => void;
  setCurrentWordHint: (hint: string) => void;
  setShowAnswer: (show: boolean) => void;
  setMetadata: (metadata: Metadata) => void;
  resetGame: () => void;
}

// Store instances cache - using a lazy initialization pattern
const storeInstances: Record<string, any> = {};

// Create the base store without immediately initializing it
const createWordToVecStore = (set: any): WordToVecState => ({
  // Initial state
  currentWord: '',
  currentDataset: null,
  guesses: [],
  gameStatus: 'playing' as 'playing' | 'won' | 'lost',
  currentWordHint: '',
  showAnswer: false,
  metadata: {
    nearestSimilarity: {
      word: '',
      similarity: 0,
    },
    tenthNearestSimilarity: {
      word: '',
      similarity: 0,
    },
    hundredthNearestSimilarity: {
      word: '',
      similarity: 0,
    },
    thousandthNearestSimilarity: {
      word: '',
      similarity: 0,
    },
  },
  
  // Actions
  setCurrentWord: (word: string) => set({ currentWord: word }),
  setCurrentDataset: (dataset: DatasetInfo | null) => set({ currentDataset: dataset }),
  addGuess: (guess: Guess) => set((state: WordToVecState) => ({ guesses: [...state.guesses, guess] })),
  setGameStatus: (status: 'playing' | 'won' | 'lost') => set({ gameStatus: status }),
  setCurrentWordHint: (hint: string) => set({ currentWordHint: hint }),
  setShowAnswer: (show: boolean) => set({ showAnswer: show }),
  setMetadata: (metadata: Metadata) => set({ metadata }),
  resetGame: () => set((state: WordToVecState) => ({
    guesses: [],
    gameStatus: 'playing',
    showAnswer: false,
    currentWordHint: '',
  })),
});

// Get or create a store instance for a specific ID
export const getWordToVecStore = (id: string) => {
  if (!storeInstances[id]) {
    // This will now defer actual React hook usage until the hook is called
    storeInstances[id] = create<WordToVecState>()((set) => createWordToVecStore(set));
  }
  return storeInstances[id];
};

// Reset function (memory only)
export const resetAllWordToVecGames = () => {
  Object.keys(storeInstances).forEach(key => {
    // Only call resetGame if the store exists and is initialized
    if (storeInstances[key]) {
      try {
        storeInstances[key]().resetGame();
      } catch (e) {
        console.error(`Error resetting game state for ${key}:`, e);
      }
    }
  });
  
  // Clear the store instances cache
  Object.keys(storeInstances).forEach(key => {
    delete storeInstances[key];
  });
};