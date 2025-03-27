"use dom";

import React, { useCallback, useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { DraggableItem } from "./DraggableItem";
import { DropZone } from "./DropZone";
import { CustomDragLayer } from "./CustomDragLayer";
import "./drag-and-drop.css";
import { Icon } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { LocalSlide } from "@/types";
import { useViewStore } from "@/store/viewStore";

interface DragAndDropProps {
	quizMode?: boolean;
	isMobileWeb: boolean;
	slide: LocalSlide;
	dom: import("expo/dom").DOMProps;
}

export default function DragAndDrop({
	quizMode = false,
	isMobileWeb,
	slide,
	dom,
}: DragAndDropProps) {

	const { setAnswer } = useViewStore();

	const question = useMemo(() => {
		return slide.assessment_info;
	}, [slide]);


	const correctIems = useMemo(() =>
		question?.options?.map((option) => ({
			text: option.text,
			match: option.match,
		})),
		[question]
	);

	const isSubmitted = slide.submitted || false;
	const isCorrect = slide.isCorrect || false;
	const showAnswer = slide.revealed || false;

	// Derive dropped items from slide.answer, if it exists
	const droppedItems = useMemo(() => {
		return slide.answer?.map((answer) => ({
			text: answer.text,
			match: answer.match,
		}));
	}, [slide.answer]);

	// From Dropped Items and Items, create object with remaining items
	const remainingItems = useMemo(() => {
		return correctIems?.filter((item) => !droppedItems?.some((droppedItem) => droppedItem.text === item.text));
	}, [correctIems, droppedItems]);

	const isTouchDevice =
		"ontouchstart" in window || navigator.maxTouchPoints > 0;

	const handleDrop = useCallback(
		(itemText: string, targetZone: string | null) => {
			if ((isSubmitted && isCorrect) || targetZone === null) return;
			// Create answer object with current dropped items plus new item
			// TODO: If dropped item is already in the answer, remove it from the answer
			let newAnswer = slide.answer?.filter((answer) => answer.text !== itemText);
			if (newAnswer) {
				newAnswer = [...newAnswer, { text: itemText, match: targetZone }];
			} else {
				newAnswer = [{ text: itemText, match: targetZone }];
			}
			// Check if the answer is correct, our answers text and matches must be the same text and matches as the correct items
			const answerCorrect = newAnswer.length === correctIems?.length && newAnswer?.every((answer) => correctIems?.some((item) => item.text === answer.text && item.match === answer.match));
			// Not submittable if there's remaining items, this means newAnswer.length < correctIems.length
			const notSubmittable = correctIems ? newAnswer.length < correctIems.length : false;
			console.log({ newAnswer, correctIems, answerCorrect, notSubmittable, remainingItems });
			setAnswer(newAnswer, answerCorrect, notSubmittable);
		},
		[droppedItems, correctIems, isSubmitted, isCorrect, showAnswer]
	);


	const zones = [...new Set(correctIems?.map((item) => item.match))];
	const firstHalf = zones.slice(0, Math.ceil(zones.length / 2));
	const secondHalf = zones.slice(Math.ceil(zones.length / 2));

	return (
		<DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
			<div className="container">
				<div className="drop-zones">
					{firstHalf.map((zone) => (
						<DropZone
							key={zone}
							zone={zone || ""}
							onDrop={handleDrop}
							isCorrect={isCorrect}
							isSubmitted={isSubmitted}
							isWrong={isSubmitted && !isCorrect}
							showAnswer={showAnswer}
						>
							<div className="drop-zone-title">{zone}</div>
							<div className="dropped-items">
								{droppedItems?.filter((item) => item.match === zone).map((item) => (
									<div key={item.text} className="dropped-item">
										<DraggableItem
											item={item}
											isDisabled={isSubmitted && (isCorrect || quizMode)}
										/>
									</div>
								))}
							</div>
						</DropZone>
					))}
					<div className="centered-icon">
						<Icon
							source="chevron-double-up"
							size={24}
							color={Colors.primary}
						/>
					</div>
					<div className="draggable-items">
						{remainingItems?.map((item) => (
							<DraggableItem
								key={item.text}
								item={item}
								isDisabled={isSubmitted && (isCorrect || quizMode)}
							/>
						))}
					</div>
					<div className="centered-icon">
						<Icon
							source="chevron-double-down"
							size={24}
							color={Colors.primary}
						/>
					</div>
					{secondHalf.map((zone) => (
						<DropZone
							key={zone}
							zone={zone || ""}
							onDrop={handleDrop}
							isCorrect={isCorrect}
							isSubmitted={isSubmitted}
							isWrong={isSubmitted && !isCorrect}
							showAnswer={showAnswer}
						>
							<div className="drop-zone-title">{zone}</div>
							<div className="dropped-items">
								{droppedItems?.filter((item) => item.match === zone).map((item) => (
									<div key={item.text} className="dropped-item">
										<DraggableItem
											item={item}
											isDisabled={isSubmitted && (isCorrect || quizMode)}
										/>
									</div>
								))}
							</div>
						</DropZone>
					))}
				</div>

				{isMobileWeb && <CustomDragLayer />}
			</div>
		</DndProvider>
	);
}
