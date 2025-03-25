import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	View,
	StyleSheet,
	Pressable,
	Platform,
	ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import SlideRenderer from "../../../components/slides/SlideRenderer";
import BottomBarNav from "@/components/navigation/SlidesBottomBarNav";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import TopNavBar from "@/components/navigation/TopNavBar";
import AnimatedSlide from "@/components/slides/AnimatedSlide";
import { useKeyPress } from "@/hooks/useKeyboard";
import TopSheet, { TopSheetRefProps } from "@/components/TopSheet";
import SlideListItem from "@/components/slides/SlideListItem";
import FeedbackComponent from "@/components/slides/Feedback";
import LoadingIndicator from "@/components/LoadingIndicator";
import styles from "@/styles/styles";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, Text } from "react-native-paper";
import { useViewStore } from "@/store/viewStore";
import ApiErrorComponent from "@/components/errors/ApiErrorComponent";

export default function ViewDetail() {
	const ref = useRef<TopSheetRefProps>(null);
	const bottomSheetRef = useRef<BottomSheet>(null);
	const { id } = useLocalSearchParams();
	const [isInitialRender, setIsInitialRender] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { slides, currentSlideIndex, fetchViewData, viewStatus, nextSlide, prevSlide, view, setCurrentSlideIndex } = useViewStore();

	const [direction, setDirection] = useState<"forward" | "backward" | null>(
		null
	);

	const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

	const prevIndexRef = useRef(currentSlideIndex);


	const openTopDrawer = useCallback(() => {
		ref?.current?.scrollToEnd();
	}, []);

	const handleSheetChanges = useCallback((index: number) => {
	}, []);


	useEffect(() => {
		try {
			const viewId = Number(id);
			if (isNaN(viewId)) {
				throw new Error("Invalid view ID");
			}
			fetchViewData(viewId).catch(err => {
				console.error("Error fetching view data:", err);
				setError("Failed to load view data. Please try again.");
			});
		} catch (err) {
			console.error("Error in fetch effect:", err);
			setError("An error occurred while loading the view.");
		}
	}, [id]);



	const handleArrowRight = () => {
		nextSlide();
	};
	const handleArrowLeft = () => {
		prevSlide();
	};

	if (Platform.OS === "web") {
		useKeyPress({
			ArrowRight: () => handleArrowRight(),
			ArrowLeft: () => handleArrowLeft(),
		});
	}
	const handleBottomSheetOpen = () => {
		setIsBottomSheetOpen(true);
		bottomSheetRef.current?.expand();
	}

	const handleBottomSheetClose = () => {
		setIsBottomSheetOpen(false);
		bottomSheetRef.current?.close();
	}

	useEffect(() => {
		if (currentSlideIndex !== prevIndexRef.current) {
			if (isBottomSheetOpen) {
				handleBottomSheetClose();
			}
			setDirection(
				currentSlideIndex > prevIndexRef.current ? "forward" : "backward"
			);
			prevIndexRef.current = currentSlideIndex;
			setIsInitialRender(false);
		}
	}, [currentSlideIndex]);

	if (error) {
		return (
			<ScreenWrapper>
				<TopNavBar />
				<ApiErrorComponent
					message={error}
					onAction={() => {
						setError(null);
						try {
							fetchViewData(Number(id));
						} catch (err) {
							console.error("Error retrying fetch:", err);
							setError("Failed to reload. Please try again later.");
						}
					}}
				/>
			</ScreenWrapper>
		);
	}

	if (viewStatus !== "READY" || !view) {
		return <LoadingIndicator />
	}

	const currentSlide = slides[currentSlideIndex] || null;

	const getWrapperStyle = () => {
		if (!currentSlide || !currentSlide.submitted) return null;
		if (currentSlide.isEvaluating) return styles.revealedWrapper;
		if (currentSlide.revealed) return styles.revealedWrapper;
		if (currentSlide.isCorrect) return styles.correctWrapper;
		if (currentSlide.isCorrect === false) return styles.incorrectWrapper;
		return null
	};

	return (
		<ScreenWrapper style={{ overflow: "hidden" }}>
			<Pressable style={[localStyles.pressableArea]}>
				<TopNavBar />
				<View style={{ flex: 1 }}>
					{/* TopSheet */}
					<TopSheet ref={ref}>
						<ScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>
							{view && view.slides && view.slides.map((slide, index) => (
								<SlideListItem
									key={`slide-${slide.slide_id}-${index}`}
									name={slide.name || `Slide ${index + 1}`}
									type={slide.type || "Unknown"}
									subtype={
										slide.type === "Assessment"
											? slide.assessment_info?.type
											: slide.type === "Content"
												? slide.contents?.[0]?.type
												: undefined
									}
									isCompleted={slides[index]?.completed || false}
									isActive={index === currentSlideIndex}
									onPress={() => setCurrentSlideIndex(index)}
								/>
							))}
						</ScrollView>
					</TopSheet>
					{/* Slides */}
					<View style={localStyles.slidesContainer}>
						{currentSlide ? (
							<AnimatedSlide
								key={`${currentSlide.slide_id}-${currentSlideIndex}`}
								direction={direction}
								isInitialRender={isInitialRender}
							>
								<SlideRenderer
									slide={currentSlide}
									index={currentSlideIndex}
									quizMode={view?.quiz || false}
								/>
							</AnimatedSlide>
						) : (
							<View style={[styles.centeredContainer, { flex: 1 }]}>
								<ApiErrorComponent
									message={"No slide content available"}
									title={"Empty View"}
									actionLabel={"Go Back"}
									onAction={() => {
										router.dismissTo({ pathname: "/modules/[id]", params: { id: view?.module_info?.id } });
									}}
								/>
							</View>
						)}
					</View>

					<View style={[styles.centeredMaxWidth, styles.slideWidth, styles.bottomBarWrapper, getWrapperStyle()]}>
						{(currentSlide && currentSlide.type === "Assessment" && currentSlide.submitted) && (
							<FeedbackComponent
								correctness={currentSlide.isCorrect || false}
								revealed={currentSlide.revealed || false}
								quizMode={view?.quiz || false}
							/>
						)}
						<BottomBarNav
							onShowTopSheet={openTopDrawer}
							onShowBottomSheet={handleBottomSheetOpen}
							onCloseBottomSheet={handleBottomSheetClose}
							showBottomSheet={isBottomSheetOpen}
						/>
					</View>
				</View>
			</Pressable>
			{isBottomSheetOpen && (
				<Pressable style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={handleBottomSheetClose}></Pressable>
			)}
			<BottomSheet
				ref={bottomSheetRef}
				onChange={handleSheetChanges}
				index={-1}
				snapPoints={["30%"]}
				enableContentPanningGesture={false}
				enableHandlePanningGesture={false}
				enablePanDownToClose={false}
				handleStyle={{ display: "none" }}
				containerStyle={{ maxWidth: 600, width: "100%", marginHorizontal: "auto" }}
				backgroundStyle={{ borderColor: "rgba(0, 0, 0, 0.1)", borderWidth: 1 }}
			>
				<BottomSheetView id="bottom-sheet-view" style={{ padding: 16, gap: 16 }}>
					<Text>The answer is not a valid answer, please try again.</Text>
					<Button mode="outlined" style={styles.defaultButton} onPress={handleBottomSheetClose}>Close</Button>
				</BottomSheetView>
			</BottomSheet>
		</ScreenWrapper>
	);
}

const localStyles = StyleSheet.create({
	pressableArea: {
		flex: 1,
		cursor: "auto",
	},
	slidesContainer: {
		flex: 1,
		position: "relative",
		flexDirection: "column",
	},
	fab: {
		position: "absolute",
		margin: 8,
		right: 0,
		bottom: 68,
	},
});
