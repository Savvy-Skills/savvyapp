import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Menu, Button } from 'react-native-paper';
import { BaseEditorProps } from './types';
import { NumericOperator } from '@/types/index';

export default function NumericalEditor({
	options,
	onOptionsChange,
	onFormDataChange
}: BaseEditorProps) {
	const [numericalOperator, setNumericalOperator] = useState<NumericOperator>('eq');
	const [numericalPrefix, setNumericalPrefix] = useState<string>('');
	const [numericalSuffix, setNumericalSuffix] = useState<string>('');
	const [operatorMenuVisible, setOperatorMenuVisible] = useState(false);
	const [correctValue, setCorrectValue] = useState<string>('');

	// Initialize with existing data if available
	useEffect(() => {
		if (options.length > 0) {
			setCorrectValue(options[0] || '');
		}
	}, []);

	// Update options when correct value changes
	useEffect(() => {
		if (correctValue) {
			onOptionsChange([correctValue]);
		}
	}, [correctValue]);

	// Update form data extras when any numerical settings change
	useEffect(() => {
		onFormDataChange({
			extras: {
				text: numericalPrefix,
				text2: numericalSuffix,
				operator: numericalOperator
			}
		});
	}, [numericalOperator, numericalPrefix, numericalSuffix]);

	// Helper function to get the operator label
	const getOperatorLabel = (operator: NumericOperator): string => {
		switch (operator) {
			case 'eq': return 'Equal to (=)';
			case 'neq': return 'Not equal to (≠)';
			case 'gt': return 'Greater than (>)';
			case 'lt': return 'Less than (<)';
			case 'gte': return 'Greater than or equal to (≥)';
			case 'lte': return 'Less than or equal to (≤)';
			default: return 'Equal to (=)';
		}
	};

	return (
		<View style={styles.container}>
			<Text variant="titleMedium" style={{ marginBottom: 8 }}>Numerical Question Settings</Text>

			<View style={styles.operatorSection}>
				<Text style={styles.sectionLabel}>Comparison Operator</Text>
				<View style={styles.operatorDropdown}>
					<Menu
						visible={operatorMenuVisible}
						onDismiss={() => setOperatorMenuVisible(false)}
						anchor={<Button
							mode="outlined"
							onPress={() => setOperatorMenuVisible(true)}
							style={styles.operatorButton}
						>
							{getOperatorLabel(numericalOperator)}
						</Button>}
					>
						<Menu.Item
							title="Equal to (=)"
							onPress={() => {
								setNumericalOperator('eq');
								setOperatorMenuVisible(false);
							}}
						/>
						<Menu.Item
							title="Not equal to (≠)"
							onPress={() => {
								setNumericalOperator('neq');
								setOperatorMenuVisible(false);
							}}
						/>
						<Menu.Item
							title="Greater than (>)"
							onPress={() => {
								setNumericalOperator('gt');
								setOperatorMenuVisible(false);
							}}
						/>
						<Menu.Item
							title="Less than (<)"
							onPress={() => {
								setNumericalOperator('lt');
								setOperatorMenuVisible(false);
							}}
						/>
						<Menu.Item
							title="Greater than or equal to (≥)"
							onPress={() => {
								setNumericalOperator('gte');
								setOperatorMenuVisible(false);
							}}
						/>
						<Menu.Item
							title="Less than or equal to (≤)"
							onPress={() => {
								setNumericalOperator('lte');
								setOperatorMenuVisible(false);
							}}
						/>
					</Menu>
				</View>
			</View>

			<View style={styles.correctValueSection}>
				<Text style={styles.sectionLabel}>Correct Value</Text>
				<View style={styles.valueRow}>
					<TextInput
						label="Prefix (optional)"
						value={numericalPrefix}
						onChangeText={setNumericalPrefix}
						placeholder="e.g. $, £, €"
						style={styles.prefixInput}
					/>
					<TextInput
						label="Value"
						value={correctValue}
						onChangeText={setCorrectValue}
						keyboardType="numeric"
						placeholder="e.g. 42"
						style={styles.valueInput}
					/>
					<TextInput
						label="Suffix (optional)"
						value={numericalSuffix}
						onChangeText={setNumericalSuffix}
						placeholder="e.g. kg, cm, %"
						style={styles.suffixInput}
					/>
				</View>
			</View>

			<Text style={styles.helpText}>
				Students will need to enter a number that matches the condition you specified.
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	helpText: {
		color: 'rgba(0, 0, 0, 0.6)',
		fontSize: 14,
		marginTop: 16,
	},
	operatorSection: {
		marginBottom: 16,
	},
	correctValueSection: {
		marginBottom: 16,
	},
	sectionLabel: {
		fontSize: 16,
		marginBottom: 8,
	},
	operatorDropdown: {
		position: 'relative',
		zIndex: 1000,
	},
	operatorButton: {
		width: '100%',
		justifyContent: 'flex-start',
	},
	valueRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	prefixInput: {
		width: '25%',
		marginRight: 8,
	},
	valueInput: {
		flex: 1,
	},
	suffixInput: {
		width: '25%',
		marginLeft: 8,
	},
}); 