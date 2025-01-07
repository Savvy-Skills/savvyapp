import { create } from 'zustand';

interface FeedbackStore {
  showFeedback: boolean;
  revealedAnswer: boolean;
  showExplanation: boolean;
  setShowFeedback: (show: boolean) => void;
  setRevealedAnswer: (revealed: boolean) => void;
  setShowExplanation: (show: boolean) => void;
  handleTryAgain: () => void;
  handleRevealAnswer: () => void;
  toggleExplanation: () => void;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  showFeedback: false,
  revealedAnswer: false,
  showExplanation: false,
  setShowFeedback: (show) => set({ showFeedback: show }),
  setRevealedAnswer: (revealed) => set({ revealedAnswer: revealed }),
  setShowExplanation: (show) => set({ showExplanation: show }),
  handleTryAgain: () => set({ showFeedback: false, revealedAnswer: false }),
  handleRevealAnswer: () => set({ revealedAnswer: true }),
  toggleExplanation: () => set((state) => ({ showExplanation: !state.showExplanation })),
}));