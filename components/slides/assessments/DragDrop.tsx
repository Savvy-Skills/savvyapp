import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import { QuestionInfo } from "@/types";
import { useCourseStore } from "@/store/courseStore";
import StatusIcon from "@/components/StatusIcon";
import AssessmentWrapper from '../AssessmentWrapper';

export type DragAndDropAssessmentProps = {
  question: QuestionInfo;
  index: number;
  quizMode?: boolean;
};

export default function DragAndDropAssessment({
  question,
  index,
  quizMode = false,
}: DragAndDropAssessmentProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [dropZoneLayouts, setDropZoneLayouts] = useState<Record<string, LayoutRectangle>>({});

  const {
    setSubmittableState,
    setCorrectnessState,
    submittedAssessments,
    submitAssessment,
  } = useCourseStore();

  const options = question.options;
  const uniqueMatches = [...new Set(options.map(option => option.match))];

  useEffect(() => {
    const allMatched = options.every(option => matches[option.text]);
    setSubmittableState(index, allMatched);
    if (allMatched) {
      const correct = options.every(option => matches[option.text] === option.match);
      setCorrectnessState(index, correct);
    }
  }, [matches, index, setSubmittableState, setCorrectnessState, options]);

  const currentSubmission = submittedAssessments.find(
    (submission) => submission.question_id === question.id
  );

  useEffect(() => {
    if (currentSubmission) {
      if (!currentSubmission.correct) {
        setIsWrong(true);
        if (quizMode) {
          setShowAnswer(true);
        }
      }
      setShowFeedback(true);
    }
  }, [currentSubmission, quizMode]);

  const resetStates = () => {
    setMatches({});
    setShowAnswer(false);
    setIsWrong(false);
    setShowFeedback(false);
  };

  const handleTryAgain = () => {
    if (!quizMode) {
      resetStates();
    }
  };

  const handleRevealAnswer = () => {
    if (!quizMode) {
      const correctMatches = options.reduce((acc, option) => {
        acc[option.text] = option.match;
        return acc;
      }, {} as Record<string, string>);
      setMatches(correctMatches);
      setShowAnswer(true);
      setIsWrong(false);
      setShowFeedback(true);
      setCorrectnessState(index, true);
      submitAssessment(question.id);
    }
  };

  const renderDraggable = (option: { text: string; match: string }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const gesture = Gesture.Pan()
      .onStart(() => {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      })
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd((event) => {
        const dropZone = findDropZone(event.absoluteX, event.absoluteY);
        if (dropZone) {
          runOnJS(setMatches)((prev: Record<string, string>) => ({ ...prev, [option.text]: dropZone }));
        }
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
      };
    });

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.draggable, animatedStyle]}>
          <Text>{option.text}</Text>
        </Animated.View>
      </GestureDetector>
    );
  };

  const renderDropZone = (match: string, isTop: boolean) => {
    const dropZoneRef = useRef<View>(null);

    useEffect(() => {
      if (dropZoneRef.current) {
        dropZoneRef.current.measure((x, y, width, height, pageX, pageY) => {
          setDropZoneLayouts(prev => ({
            ...prev,
            [match]: { x: pageX, y: pageY, width, height }
          }));
        });
      }
    }, [match]);

    const matchedOption = Object.entries(matches).find(([_, value]) => value === match);

    return (
      <Surface style={[styles.dropZone, isTop ? styles.topDropZone : styles.bottomDropZone]} ref={dropZoneRef}>
        <Text style={styles.dropZoneText}>{match}</Text>
        {matchedOption && (
          <View style={styles.matchedItem}>
            <Text style={styles.matchedItemText}>{matchedOption[0]}</Text>
            <StatusIcon
              isCorrect={matchedOption[1] === options.find(o => o.text === matchedOption[0])?.match}
              isWrong={isWrong}
              showAnswer={showAnswer}
            />
          </View>
        )}
      </Surface>
    );
  };

  const findDropZone = (x: number, y: number): string | null => {
    for (const [match, layout] of Object.entries(dropZoneLayouts)) {
      if (
        x >= layout.x &&
        x <= layout.x + layout.width &&
        y >= layout.y &&
        y <= layout.y + layout.height
      ) {
        return match;
      }
    }
    return null;
  };

  const insets = useSafeAreaInsets();

  return (
    <AssessmentWrapper
      question={question}
      onTryAgain={quizMode ? undefined : handleTryAgain}
      onRevealAnswer={quizMode ? undefined : handleRevealAnswer}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
      quizMode={quizMode}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }]}>
        {renderDropZone(uniqueMatches[0], true)}
        <View style={styles.draggablesContainer}>
          {options.map((option) => !matches[option.text] && renderDraggable(option))}
        </View>
        {renderDropZone(uniqueMatches[1], false)}
      </View>
    </AssessmentWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  draggablesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggable: {
    padding: 12,
    margin: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  dropZone: {
    height: 96,
    borderWidth: 2,
    borderColor: '#a0a0a0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  topDropZone: {
    marginBottom: 16,
  },
  bottomDropZone: {
    marginTop: 16,
  },
  dropZoneText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  matchedItemText: {
    marginRight: 8,
  },
});

