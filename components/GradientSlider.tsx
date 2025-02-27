import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ViewStyle, LayoutRectangle } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';
import { ClassConfig } from '@/types';

interface GradientSliderProps {
	value: number;
	onValueChange: (value: number) => void;
	minimumValue: number;
	maximumValue: number;
	step?: number;
	disabled?: boolean;
	classes: {
		negative: ClassConfig;
		neutral: ClassConfig;
		positive: ClassConfig;
	};
}

const GradientSlider = ({
	value,
	onValueChange,
	minimumValue,
	maximumValue,
	step = 0.1,
	disabled,
	classes
}: GradientSliderProps) => {
	const [leftFlex, setLeftFlex] = useState(0.5);
	const [rightFlex, setRightFlex] = useState(0.5);
	const [sliderWidth, setSliderWidth] = useState(0);
	const [neutralPosition, setNeutralPosition] = useState(0);
	const containerRef = useRef<View>(null);

	// Handle slider layout to get width
	const onLayout = (event: { nativeEvent: { layout: LayoutRectangle } }) => {
		const { width } = event.nativeEvent.layout;
		setSliderWidth(width);
		updateNeutralPosition(width, value);
	};

	// Update neutral position based on slider value and width
	const updateNeutralPosition = (width: number, currentValue: number) => {
		const range = maximumValue - minimumValue;
		const valuePercent = (currentValue - minimumValue) / range;
		const labelWidth = 80; // Width of the neutral label
		const halfLabelWidth = labelWidth / 2;
		
		// Calculate raw position
		let position = width * valuePercent;
		
		// Constrain position to keep label fully visible
		position = Math.max(halfLabelWidth, position); // Don't go too far left
		position = Math.min(width - halfLabelWidth, position); // Don't go too far right
		
		setNeutralPosition(position);
	};

	useEffect(() => {
		// Convert value to proportion (0-1)
		const range = maximumValue - minimumValue;
		const proportion = (value - minimumValue) / range;

		setLeftFlex(proportion);
		setRightFlex(1 - proportion);

		// Update neutral label position
		if (sliderWidth > 0) {
			updateNeutralPosition(sliderWidth, value);
		}
	}, [value, minimumValue, maximumValue, sliderWidth]);

	return (
		<View style={styles.container} ref={containerRef} onLayout={onLayout}>
			<View style={styles.sliderContainer}>
				{/* Gradient Track */}
				<View style={styles.gradientTrack}>
					<View style={[styles.leftTrack, { flex: leftFlex }]}>
						<View style={[styles.leftGradient, { backgroundColor: classes.negative.color }]} />
					</View>

					<View style={[styles.middlePoint, { backgroundColor: classes.neutral.color }]} />

					<View style={[styles.rightTrack, { flex: rightFlex }]}>
						<View style={[styles.rightGradient, { backgroundColor: classes.positive.color }]} />
					</View>
				</View>

				{/* Slider (positioned above the gradient) */}
				<Slider
					value={value}
					onValueChange={onValueChange}
					minimumValue={minimumValue}
					maximumValue={maximumValue}
					step={step}
					style={styles.slider}
					minimumTrackTintColor="transparent"
					maximumTrackTintColor="transparent"
					thumbTintColor={Colors.primary}
					disabled={disabled}
				/>
			</View>

			{/* Class Labels */}
			<View style={styles.labelsContainer}>
				{/* Negative class (left) */}
				<Text style={styles.classLabel}>{classes.negative.value} {classes.negative.emoji}</Text>
				
				{/* Neutral class (follows slider) */}
				<Text 
					style={[
						styles.neutralLabel, 
						{ 
							left: neutralPosition - 40, // Center the label (half of 80px width)
							backgroundColor: classes.neutral.color 
						}
					]}
				>
					{classes.neutral.value} {classes.neutral.emoji}
				</Text>
				
				{/* Positive class (right) */}
				<Text style={[styles.classLabel, styles.rightLabel]}>
					{classes.positive.value} {classes.positive.emoji}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 75, // Increased height to accommodate labels
		marginVertical: 10,
	},
	sliderContainer: {
		position: 'relative',
		height: 40,
	},
	gradientTrack: {
		position: 'absolute',
		top: 18,
		left: 0,
		right: 0,
		height: 4,
		flexDirection: 'row',
		alignItems: 'center',
	},
	leftTrack: {
		height: '100%',
		overflow: 'hidden',
	},
	rightTrack: {
		height: '100%',
		overflow: 'hidden',
	},
	leftGradient: {
		flex: 1,
		height: '100%',
	},
	rightGradient: {
		flex: 1,
		height: '100%',
	},
	middlePoint: {
		width: 60,
		height: 4,
		borderRadius: 4,
		zIndex: 1,
	},
	slider: {
		width: '100%',
		height: 40,
		zIndex: 2,
	},
	labelsContainer: {
		position: 'relative',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 5,
		height: 25,
	},
	classLabel: {
		fontSize: 12,
		color: Colors.text,
		fontWeight: 'bold',
	},
	rightLabel: {
		textAlign: 'right',
	},
	neutralLabel: {
		position: 'absolute',
		fontSize: 12,
		color: Colors.text,
		fontWeight: 'bold',
		backgroundColor: '#eeeeee',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 10,
		textAlign: 'center',
		zIndex: 5,
		minWidth: 80,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default GradientSlider; 