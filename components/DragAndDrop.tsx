"use client";

import React, { useState, useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { DraggableItem } from "./react/DraggableItem";
import { DropZone } from "./react/DropZone";
import { CustomDragLayer } from "./react/CustomDragLayer";
import StatusIcon from "@/components/StatusIcon";
import "./drag-and-drop.css";
import { create } from "zustand";
import { useCourseStore } from "@/store/courseStore";

interface Item {
  text: string;
  match: string;
}

interface DragAndDropProps {
  items: Item[];
  index: number;
  quizMode?: boolean;
  questionId: number;
  tryAgain: boolean;
  showAnswer: boolean;
  isSubmitted: boolean;
  isCorrect: boolean;
}

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

export default function DragAndDrop({
  items,
  index,
  quizMode = false,
  questionId,
  tryAgain,
  showAnswer,
  isSubmitted,
  isCorrect,
}: DragAndDropProps) {
  const { droppedItemsState, setDroppedItemsState } = useDragDropStore();
  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>(
    () => {
      // Initialize from store or create new state
      return (
        droppedItemsState[questionId] ||
        (() => {
          const zones = [...new Set(items.map((item) => item.match))];
          return zones.reduce((acc, zone) => ({ ...acc, [zone]: [] }), {});
        })()
      );
    }
  );

  const { setSubmittableState, setCorrectnessState, submittedAssessments } =
    useCourseStore();

  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Update store when droppedItems changes
  useEffect(() => {
    setDroppedItemsState(questionId, droppedItems);
  }, [droppedItems, questionId, setDroppedItemsState]);

  useEffect(() => {
    const allItemsDropped = items.every((item) =>
      Object.values(droppedItems).some((zoneItems) =>
        zoneItems.includes(item.text)
      )
    );
    setSubmittableState(index, allItemsDropped);
    if (allItemsDropped) {
      const correct = items.every((item) =>
        droppedItems[item.match]?.includes(item.text)
      );
      setCorrectnessState(index, correct);
    }
  }, [droppedItems, index, items, setSubmittableState, setCorrectnessState]);

  const handleDrop = useCallback(
    (itemText: string, targetZone: string | null) => {
      if (isSubmitted && isCorrect) return;
      setDroppedItems((prev) => {
        const newDroppedItems = { ...prev };
        Object.keys(newDroppedItems).forEach((zone) => {
          newDroppedItems[zone] = newDroppedItems[zone].filter(
            (text) => text !== itemText
          );
        });
        if (targetZone) {
          newDroppedItems[targetZone] = [
            ...newDroppedItems[targetZone],
            itemText,
          ];
        }
        return newDroppedItems;
      });
    },
    [isSubmitted, isCorrect]
  );

  const getUndropedItems = () => {
    const allDroppedItems = Object.values(droppedItems).flat();
    return items.filter((item) => !allDroppedItems.includes(item.text));
  };

  const resetStates = () => {
    const newState = (() => {
      const zones = [...new Set(items.map((item) => item.match))];
      return zones.reduce((acc, zone) => ({ ...acc, [zone]: [] }), {});
    })();
    setDroppedItems(newState);
    setDroppedItemsState(questionId, newState);
  };

  useEffect(() => {
    resetStates();
  }, [tryAgain]);

  useEffect(() => {
    if (showAnswer) {
      handleRevealAnswer();
    }
  }, [showAnswer]);

  const handleRevealAnswer = () => {
    if (!quizMode) {
      const correctDroppedItems = items.reduce((acc, item) => {
        if (!acc[item.match]) {
          acc[item.match] = [];
        }
        acc[item.match].push(item.text);
        return acc;
      }, {} as Record<string, string[]>);
      setDroppedItems(correctDroppedItems);
      setDroppedItemsState(questionId, correctDroppedItems);
    }
  };

  const zones = [...new Set(items.map((item) => item.match))];
  const firstHalf = zones.slice(0, Math.ceil(zones.length / 2));
  const secondHalf = zones.slice(Math.ceil(zones.length / 2));

  return (
    <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
      <div className="container">
        <div className="drop-zones">
          {firstHalf.map((zone) => (
            <DropZone
              key={zone}
              zone={zone}
              onDrop={handleDrop}
              isCorrect={isCorrect}
              isSubmitted={isSubmitted}
              isWrong={!isCorrect}
            >
              <div className="drop-zone-title">{zone}</div>
              <div className="dropped-items">
                {droppedItems[zone].map((text) => {
                  const item = items.find((i) => i.text === text);
                  if (!item) return null;
                  return (
                    <div key={item.text} className="dropped-item">
                      <DraggableItem
                        item={item}
                        isDisabled={isSubmitted && isCorrect}
                      />
                    </div>
                  );
                })}
              </div>
            </DropZone>
          ))}
          <div className="draggable-items">
            {getUndropedItems().map((item) => (
              <DraggableItem
                key={item.text}
                item={item}
                isDisabled={isSubmitted && isCorrect}
              />
            ))}
          </div>
          {secondHalf.map((zone) => (
            <DropZone
              key={zone}
              zone={zone}
              onDrop={handleDrop}
              isCorrect={isCorrect}
              isSubmitted={isSubmitted}
              isWrong={!isCorrect}
            >
              <div className="drop-zone-title">{zone}</div>
              <div className="dropped-items">
                {droppedItems[zone].map((text) => {
                  const item = items.find((i) => i.text === text);
                  if (!item) return null;
                  return (
                    <div key={item.text} className="dropped-item">
                      <DraggableItem
                        item={item}
                        isDisabled={isSubmitted && isCorrect}
                      />
                    </div>
                  );
                })}
              </div>
            </DropZone>
          ))}
        </div>

        <CustomDragLayer />
      </div>
    </DndProvider>
  );
}