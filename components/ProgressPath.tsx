import { ViewType } from "@/types";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Icon } from "react-native-paper";
import Svg, { Path, Circle, Text, ForeignObject, G } from "react-native-svg";


interface ProgressPathProps {
	levels: ViewType[];
	maxWidth?: number;
	circleRadius?: number;
	circleColor?: string;
	innerCircleColor?: string;
	lineColor?: string;
	textColor?: string;
	textSize?: number;
	controlPointOffsetX?: number;
	controlPointOffsetY?: number;
	lineOffset?: number;
}

const ProgressPath = ({
	levels,
	circleRadius = 25,
	circleColor = "silver",
	innerCircleColor = "white",
	lineColor = "gray",
	textColor = "black",
	textSize = 12,
	controlPointOffsetX = 50,
	lineOffset = 5,
}: ProgressPathProps) => {
	const [svgHeight, setSvgHeight] = useState(0);
	const [svgWidth, setSvgWidth] = useState(0);

	const padding = circleRadius + 30;
	const verticalGap = 60;

	const calculateCirclePosition = (index: number) => {
		const x = index % 2 === 0 ? svgWidth / 2 - 40 : svgWidth / 2 + 40;
		const y = padding + index * (circleRadius + verticalGap);
		return { cx: x, cy: y };
	};

	const handleCirclePress = useCallback((level: ViewType) => {
		router.navigate({
			pathname: "/views/[id]",
			params: {
				id: level.id.toString(),
			},
		});
	}, []);

	const generatePathData = () => {
		return levels.map((_, index) => {
			const { cx, cy } = calculateCirclePosition(index);
			const nextLevel = levels[index + 1];
			const isEven = index % 2 === 0;
			const radius = isEven ? circleRadius / 2 : -circleRadius / 2;
			const lOffset = isEven ? lineOffset : -lineOffset;
			const cpOffset = isEven ? controlPointOffsetX : -controlPointOffsetX;
			if (nextLevel) {
				const { cx: nextCx, cy: nextCy } = calculateCirclePosition(index + 1);
				const firstLine = { cx: nextCx + radius + lOffset, cy: cy };
				const firstControlPoint = { cx: firstLine.cx + cpOffset, cy: cy };
				const secondControlPoint = { cx: firstControlPoint.cx, cy: nextCy };
				return `M${cx},${cy} L${firstLine.cx},${firstLine.cy} C${firstControlPoint.cx} ${firstControlPoint.cy},${secondControlPoint.cx} ${secondControlPoint.cy},${nextCx + lOffset + radius} ${nextCy} T${nextCx},${nextCy}`;
			}
			return "";
		}).join('');
	};

	return (
		<View
			style={styles.container}
			onLayout={(event) => {
				const { height, width } = event.nativeEvent.layout;
				setSvgHeight(height);
				setSvgWidth(width);
			}}
		>
			<Svg height={svgHeight} width={svgWidth}>
				<Path
					d={generatePathData()}
					stroke={lineColor}
					strokeWidth={20}
					fill="none"
				/>

				{levels.map((level, index) => {
					const { cx, cy } = calculateCirclePosition(index);
					return (
						<G key={`${level.order}-${level.name}`} onPress={() => handleCirclePress(level)}>
							<Circle cx={cx} cy={cy} r={circleRadius} fill={circleColor}/>
							<Circle cx={cx} cy={cy} r={circleRadius / 1.3} fill={innerCircleColor} pointerEvents="none"/>
							<ForeignObject x={cx-circleRadius/2} y={cy-circleRadius/2} width={circleRadius * 2} height={circleRadius * 2} pointerEvents="none">
								<Icon source="abacus" size={circleRadius} color={textColor} />
							</ForeignObject>
							<Text
								x={cx}
								y={cy + circleRadius * 1.3}
								textAnchor="middle"
								alignmentBaseline="middle"
								fontSize={textSize}
								fill={textColor}
								pointerEvents="none"
							>
								{level.name}
							</Text>
						</G>
					);
				})}
			</Svg>
		</View>
	);
};

export default ProgressPath;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		maxWidth: 300,
	},
});

