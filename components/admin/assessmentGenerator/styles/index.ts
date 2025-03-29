import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 8,
  },
  conceptsContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  typeLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  conceptInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  conceptInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    justifyContent: 'center',
  },
  chipsScrollView: {
    maxHeight: 80,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingCard: {
    marginBottom: 20,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4361ee',
  },
  progressText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  resultsCard: {
    marginBottom: 20,
  },
  resultsList: {
    padding: 0,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  assessmentCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  savedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4cc9f0',
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  assessmentTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  assessmentActions: {
    justifyContent: 'center',
  },
  typeIndicator: {
    marginTop: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  assessmentDivider: {
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 8,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4cc9f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  incorrectOption: {
    backgroundColor: 'rgba(247, 37, 133, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  correctChip: {
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
  },
  previewLabel: {
    fontWeight: '500',
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchItem: {
    flex: 1,
    padding: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 4,
  },
  matchArrow: {
    marginHorizontal: 8,
    color: '#666',
  },
  matchTarget: {
    flex: 1,
    padding: 8,
    backgroundColor: 'rgba(76, 201, 240, 0.05)',
    borderRadius: 4,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 4,
  },
  orderNumber: {
    width: 24,
    fontWeight: 'bold',
  },
  orderText: {
    flex: 1,
  },
  blankQuestion: {
    padding: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
  },
  blankHighlight: {
    backgroundColor: '#e0e7ff',
    padding: 2,
    borderRadius: 4,
    color: '#4361ee',
    fontWeight: 'bold',
  },
  distractorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  distractor: {
    margin: 4,
  },
  assessmentTypesContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  typesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeChip: {
    marginRight: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  activeTypeChip: {
    backgroundColor: 'rgba(67, 97, 238, 0.3)',
  },
  // Update editor styles for inline editing
  editorCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4361ee',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editorDivider: {
    marginBottom: 16,
  },
  editorContent: {
    marginVertical: 16,
  },
  editorInput: {
    marginBottom: 16,
  },
  editorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4361ee',
  },
  explanationLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  explanationText: {
    fontStyle: 'italic',
  },
  // Rubric styles
  rubricContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(76, 201, 240, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 201, 240, 0.2)',
  },
  criterion: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
  },
  criterionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  level: {
    padding: 10,
    backgroundColor: 'rgba(67, 97, 238, 0.03)',
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4361ee',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelName: {
    fontWeight: 'bold',
  },
  levelPoints: {
    fontStyle: 'italic',
  },
  levelDescription: {
    fontSize: 14,
  },
  // Numerical styles
  numericPrefix: {
    marginRight: 2,
  },
  numericValue: {
    fontWeight: 'bold',
  },
  numericSuffix: {
    marginLeft: 2,
  },
  numericOperator: {
    fontStyle: 'italic',
    color: '#666',
  },
  // Category styling for Drag and Drop
  categoryContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryTitle: {
    padding: 8,
    fontWeight: 'bold',
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  // Filter buttons
  filterButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4361ee',
  },
  // Styles for the header buttons
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jsonButton: {
    marginRight: 8,
  },
  
  // Styles for action buttons
  actionButtons: {
    flexDirection: 'row',
	alignItems: 'center',
  },
  improveButton: {
    marginRight: 8,
  },
  
  // Styles for the JSON modal
  modalContainer: {
    margin: 20,
    flex: 1,
  },
  jsonModal: {
    padding: 20,
    borderRadius: 10,
    flex: 1,
  },
  jsonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDivider: {
    marginVertical: 10,
  },
  jsonScrollView: {
    flex: 1,
  },
  jsonContent: {
    flex: 1,
  },
  copyButton: {
    marginBottom: 16,
  },
  jsonTextContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    flex: 1,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  
  // Styles for the improvement modal
  improvementModal: {
    padding: 20,
    borderRadius: 10,
    flex: 1,
  },
  improvementScrollView: {
    flex: 1,
  },
  improvementContent: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  assessmentPreviewCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
  },
  instructionsInput: {
    marginBottom: 16,
  },
  improveActionButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  comparisonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  comparisonButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  assessmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllButton: {
    marginLeft: 8,
  },
  removeButton: {
    marginRight: 8,
  },
  typesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
}); 