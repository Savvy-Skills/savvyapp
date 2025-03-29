 
import { View, StyleSheet } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Assessment } from '@/types/index';

interface AssessmentPreviewProps {
  assessment: Assessment;
}

export default function AssessmentPreview({ assessment }: AssessmentPreviewProps) {
  const { type, options = [], rubric } = assessment;
  
  if (type === 'Open Ended') {
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Sample Answer:</Text>
        {options.find(opt => opt.isCorrect) && (
          <View style={styles.correctOption}>
            <Text>{options.find(opt => opt.isCorrect)?.text}</Text>
          </View>
        )}
        
        {/* Display rubric for open ended questions */}
        {rubric && rubric.length > 0 && (
          <View style={styles.rubricContainer}>
            <Text variant="bodyMedium" style={[styles.previewLabel, { marginTop: 16 }]}>Grading Rubric:</Text>
            
            {rubric.map((criterion, idx) => (
              <View key={idx} style={styles.criterion}>
                <Text style={styles.criterionTitle}>{criterion.criterion}</Text>
                
                {criterion.levels.map((level, levelIdx) => (
                  <View key={levelIdx} style={styles.level}>
                    <View style={styles.levelHeader}>
                      <Text style={styles.levelName}>{level.name}</Text>
                      <Text style={styles.levelPoints}>{level.value} points</Text>
                    </View>
                    <Text style={styles.levelDescription}>{level.description}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }
  
  if (type === 'Match the Words' || type === 'Drag and Drop') {
    if (type === 'Drag and Drop') {
      // For drag and drop, organize by categories
      const categories = [...new Set(options.map(opt => opt.match))];
      
      return (
        <View>
          <Text variant="bodyMedium" style={styles.previewLabel}>Categories and Items:</Text>
          
          {categories.map((category, catIdx) => (
            <View key={catIdx} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category}</Text>
              
              {options.filter(opt => opt.match === category).map((item, itemIdx) => (
                <View key={itemIdx} style={styles.matchRow}>
                  <Text style={styles.matchItem}>{item.text}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }
    
    // For standard matching
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Matching Items:</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.matchRow}>
            <Text style={styles.matchItem}>{option.text}</Text>
            <Text style={styles.matchArrow}>→</Text>
            <Text style={styles.matchTarget}>{option.match}</Text>
          </View>
        ))}
      </View>
    );
  }
  
  if (type === 'Order List') {
    const sortedOptions = [...options].sort((a, b) => a.correctOrder - b.correctOrder);
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Correct Order:</Text>
        {sortedOptions.map((option, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.orderNumber}>{index + 1}.</Text>
            <Text style={styles.orderText}>{option.text}</Text>
          </View>
        ))}
      </View>
    );
  }
  
  if (type === 'Fill in the Blank') {
    // Create a component to display fill-in-the-blank with highlighted blanks
    const renderHighlightedText = () => {
      const parts = assessment.text.split(/(\[[^\]]+\])/g);
      
      return (
        <Text>
          {parts.map((part, idx) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              const content = part.slice(1, -1);
              return (
                <Text key={idx} style={styles.blankHighlight}>
                  {content}
                </Text>
              );
            }
            return <Text key={idx}>{part}</Text>;
          })}
        </Text>
      );
    };
    
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Question with Blanks:</Text>
        <View style={styles.blankQuestion}>
          {renderHighlightedText()}
        </View>
        
        {options.length > 0 && (
          <View>
            <Text variant="bodyMedium" style={[styles.previewLabel, { marginTop: 10 }]}>Distractors:</Text>
            <View style={styles.distractorsContainer}>
              {options.map((option, index) => (
                <Chip key={index} style={styles.distractor}>{option.text}</Chip>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }
  
  if (type === 'Numerical') {
    const answer = options.find(opt => opt.isCorrect);
    
    // Get operator and any prefix/suffix
    let operatorText = '';
    let prefixText = '';
    let suffixText = '';
    
    if (assessment.extras) {
      const operatorMap: Record<string, string> = {
        'eq': 'equals',
        'neq': 'not equal to',
        'lt': 'less than',
        'gt': 'greater than',
        'lte': 'less than or equal to',
        'gte': 'greater than or equal to'
      };
      
      operatorText = operatorMap[assessment.extras.operator] || 'equals';
      prefixText = assessment.extras.text || '';
      suffixText = assessment.extras.text2 || '';
    }
    
    return (
      <View>
        <Text variant="bodyMedium" style={styles.previewLabel}>Numerical Answer:</Text>
        {answer && (
          <View style={styles.correctOption}>
            <Text>
              {prefixText && <Text style={styles.numericPrefix}>{prefixText}</Text>}
              <Text style={styles.numericValue}>{answer.text}</Text>
              {suffixText && <Text style={styles.numericSuffix}>{suffixText}</Text>}
              {operatorText !== 'equals' && <Text style={styles.numericOperator}> ({operatorText})</Text>}
            </Text>
          </View>
        )}
      </View>
    );
  }
  
  // Default for Single Choice, Multiple Choice, True or False
  return (
    <View>
      {options.map((option, index) => (
        <View 
          key={index} 
          style={[
            styles.option, 
            option.isCorrect ? styles.correctOption : styles.incorrectOption
          ]}
        >
          <Text>{option.text}</Text>
          {option.isCorrect && (
            <Chip compact icon="check" style={styles.correctChip}>Correct</Chip>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  previewLabel: {
    fontWeight: '500',
    marginBottom: 8,
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
});