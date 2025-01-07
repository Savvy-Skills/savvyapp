import React from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MD3Colors } from "react-native-paper";

interface RichTextProps {
	content: string; // The input plain text to parse
}

const RichTextRenderer: React.FC<RichTextProps> = ({ content }) => {
	const parseContent = (text: string) => {
		
		const lines = text.split("\n");

		return lines.map((line, index) => {
			const elements: React.ReactNode[] = [];
			const parts = line.split(/(\[.*?\])/); // Split by markers like [color:red], [size:20], [img:url,w,h]

			parts.forEach((part, idx) => {
				if (part.startsWith("[") && part.endsWith("]")) {
					const marker = part.slice(1, -1);

					// Parse color markers
					if (marker.startsWith("color:")) {
						const color = marker.split(":")[1];
						elements.push(
							<Text key={`${index}-${idx}`} style={{ color }}>{part}</Text>
						);
					}

					// Parse size markers
					else if (marker.startsWith("size:")) {
						const size = parseInt(marker.split(":")[1], 10);
						elements.push(
							<Text key={`${index}-${idx}`} style={{ fontSize: size }}>
								{parts[idx + 1]}
							</Text>
						);
					}

					// Parse image markers
					else if (marker.startsWith("img:")) {
						const [url, width, height] = marker.split(":")[1].split(",");
						elements.push(
							<Image
								key={`${index}-${idx}`}
								source={{ uri: url }}
								style={{ width: 100, height: 100 }}
							/>
						);
					}
				} else {
					elements.push(
						<Text key={`${index}-${idx}`} style={styles.text}>
							{part}
						</Text>
					);
				}
			});

			// Return line with breaks
			return (
					<Text key={index} style={styles.line}>
						{elements}
					</Text>
			);
		});
	};

	return <ScrollView style={styles.container}>{parseContent(content)}</ScrollView>;
};

const styles = StyleSheet.create({
	container: {
		padding: 10,
		flex: 1,
	},
	text: {
		fontSize: 14,
		color: MD3Colors.neutral80,
	},
	line: {
		marginBottom: 5,
	},
});

export default RichTextRenderer;
