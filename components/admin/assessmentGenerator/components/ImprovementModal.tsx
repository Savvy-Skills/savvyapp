import React from 'react';
import { View, ScrollView } from 'react-native';
import { Surface, Text, IconButton, Button, Divider, Portal, Modal, TextInput } from 'react-native-paper';
import { ImprovementModalProps } from '../types';
import { styles } from '../styles';
import AssessmentPreview from '@/components/admin/AssessmentPreview';

const ImprovementModal = ({
	visible,
	onDismiss,
	assessmentToImprove,
	improvementInstructions,
	setImprovementInstructions,
	handleImproveAssessment,
	improvementLoading,
	improvedAssessment,
	setImprovedAssessment,
	handleAcceptImprovedAssessment
}: ImprovementModalProps) => (
	<Portal>
		<Modal
			visible={visible}
			onDismiss={onDismiss}
			contentContainerStyle={styles.modalContainer}
		>
			<Surface style={styles.improvementModal}>
				<View style={styles.jsonHeader}>
					<Text variant="titleLarge">Improve Assessment</Text>
					<IconButton
						icon="close"
						onPress={onDismiss}
						disabled={improvementLoading}
					/>
				</View>
				<Divider style={styles.modalDivider} />

				<ScrollView style={styles.improvementScrollView}>
					{assessmentToImprove && (
						<View style={styles.improvementContent}>
							<Text variant="titleMedium" style={styles.sectionTitle}>Original Assessment</Text>
							<Surface style={styles.assessmentPreviewCard}>
								{/* Add assessment text for all but fill in the blank type */}
								{assessmentToImprove.type !== 'Fill in the Blank' && (
									<Text variant="bodyMedium" style={styles.categoryTitle}>{assessmentToImprove.text}</Text>
								)}
								<AssessmentPreview
									assessment={assessmentToImprove}
								/>
							</Surface>

							{!improvedAssessment ? (
								<>
									<Text variant="titleMedium" style={styles.sectionTitle}>Improvement Instructions</Text>
									<TextInput
										label="Instructions for improvement"
										value={improvementInstructions}
										onChangeText={setImprovementInstructions}
										multiline
										numberOfLines={4}
										mode="outlined"
										style={styles.instructionsInput}
										placeholder="e.g., Make it more challenging, add more distractors, increase complexity, align with grade level, etc."
										disabled={improvementLoading}
									/>

									<Button
										mode="contained"
										onPress={handleImproveAssessment}
										loading={improvementLoading}
										disabled={improvementLoading || !improvementInstructions.trim()}
										icon="auto-fix"
										style={styles.improveActionButton}
									>
										Generate Improved Version
									</Button>
								</>
							) : (
								<>
									<Text variant="titleMedium" style={styles.sectionTitle}>Improved Assessment</Text>
									{assessmentToImprove.type !== 'Fill in the Blank' && (
										<Text variant="bodyMedium" style={styles.categoryTitle}>{assessmentToImprove.text}</Text>
									)}
									<Surface style={styles.assessmentPreviewCard}>
										<AssessmentPreview assessment={improvedAssessment} />
									</Surface>

									<View style={styles.comparisonActions}>
										<Button
											mode="outlined"
											onPress={() => setImprovedAssessment(null)}
											style={styles.comparisonButton}
										>
											Reject & Try Again
										</Button>
										<Button
											mode="contained"
											onPress={handleAcceptImprovedAssessment}
											style={styles.comparisonButton}
										>
											Accept Improvement
										</Button>
									</View>
								</>
							)}
						</View>
					)}
				</ScrollView>
			</Surface>
		</Modal>
	</Portal>
);

export default ImprovementModal; 