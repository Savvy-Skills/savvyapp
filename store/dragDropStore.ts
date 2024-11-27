import { create } from "zustand";

interface DropStore {
  droppedItemsState: Record<number, Record<string, string[]>>;
  setDroppedItemsState: (
    questionId: number,
    items: Record<string, string[]>
  ) => void;
}

// Create a store slice for drag and drop state
const useDragDropStore = create<DropStore>((set) => ({
  droppedItemsState: {},
  setDroppedItemsState: (questionId: number, items: Record<string, string[]>) =>
    set((state) => ({
      droppedItemsState: {
        ...state.droppedItemsState,
        [questionId]: items,
      },
    })),
}));

export default useDragDropStore