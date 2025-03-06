import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DatasetInfo } from '../types';

type Guess = {
  word: string;
  similarity: number | null;
};

type Metadata = {
  nearestSimilarity: number;
  tenthNearestSimilarity: number;
  hundredthNearestSimilarity: number;
  thousandthNearestSimilarity: number;
};

interface WordToVecState {
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

// Factory function to create a store for a specific game ID
export const createWordToVecStore = (id: string) => {
  return create<WordToVecState>()(
    persist(
      (set) => ({
        // Initial state
        currentWord: '',
        currentDataset: null,
        guesses: [],
        gameStatus: 'playing',
        currentWordHint: '',
        showAnswer: false,
        metadata: {
          nearestSimilarity: 0,
          tenthNearestSimilarity: 0,
          hundredthNearestSimilarity: 0,
          thousandthNearestSimilarity: 0,
        },
        
        // Actions
        setCurrentWord: (word) => set({ currentWord: word }),
        setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
        addGuess: (guess) => set((state) => ({ guesses: [...state.guesses, guess] })),
        setGameStatus: (status) => set({ gameStatus: status }),
        setCurrentWordHint: (hint) => set({ currentWordHint: hint }),
        setShowAnswer: (show) => set({ showAnswer: show }),
        setMetadata: (metadata) => set({ metadata }),
        resetGame: () => set({
          guesses: [],
          gameStatus: 'playing',
          showAnswer: false,
          currentWordHint: '',
        }),
      }),
      {
        name: `word-to-vec-game-${id}`,
        storage: createJSONStorage(() => localStorage),
      }
    )
  );
};

// Store instances cache
const storeInstances: Record<string, ReturnType<typeof createWordToVecStore>> = {};

// Get or create a store instance for a specific ID
export const getWordToVecStore = (id: string) => {
  if (!storeInstances[id]) {
    storeInstances[id] = createWordToVecStore(id);
  }
  return storeInstances[id];
};