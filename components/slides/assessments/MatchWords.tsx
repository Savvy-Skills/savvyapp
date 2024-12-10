import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Animated } from "react-native";
import { Text, IconButton } from "react-native-paper";
import AssessmentWrapper from "../AssessmentWrapper";
import { AssessmentAnswer, useCourseStore } from "@/store/courseStore";
import { AssessmentProps } from "./SingleChoice";
import StatusIcon from "@/components/StatusIcon";
import { Colors } from "@/constants/Colors";
import { QuestionInfo } from "@/types";

type Card = {
  id: string;
  text: string;
  type: "option" | "match";
  isMatched: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
};

const ANIMATION_TIMING = {
  FEEDBACK_DURATION: 750,
  SHRINK_DURATION: 300,
  SHAKE_DURATION: 500,
} as const;

function createAnswer(question: QuestionInfo): AssessmentAnswer {
  return {
    answer: question.options.map((opt) => ({
      text: opt.text,
      match: opt.match,
    })),
    revealed: false,
  };
}

export default function MatchWordsAssessment({
  question,
  index,
  quizMode = false,
}: AssessmentProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [originalCards, setOriginalCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [allMatched, setAllMatched] = useState(false);
  const scaleAnims = useRef<Animated.Value[]>([]).current;
  const shakeAnims = useRef<Animated.Value[]>([]).current;

  const {
    setCorrectnessState,
    submittedAssessments,
    submitAssessment,
    currentSlideIndex,
    setAnswer,
  } = useCourseStore();

  const isActive = index === currentSlideIndex;

  useEffect(() => {
    initializeCards();
  }, [question]);

  const initializeCards = () => {
    const options = question.options.map((opt, idx) => ({
      id: `option-${idx}`,
      text: opt.text,
      type: "option" as const,
      isMatched: false,
      showFeedback: false,
      isCorrect: false,
    }));

    const matches = question.options.map((opt, idx) => ({
      id: `match-${idx}`,
      text: opt.match,
      type: "match" as const,
      isMatched: false,
      showFeedback: false,
      isCorrect: false,
    }));

    const allCards = [...options, ...matches];
    const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    // Original cards are used to display the correct matches, we should have an array where the match is next to the option in the array
    const originalCards = [];
    for (let i = 0; i < options.length; i++) {
      originalCards.push(options[i]);
      originalCards.push(matches[i]);
    }
    setOriginalCards(originalCards);
    scaleAnims.length = shuffledCards.length;
    shakeAnims.length = shuffledCards.length;
    shuffledCards.forEach((_, index) => {
      scaleAnims[index] = new Animated.Value(1);
      shakeAnims[index] = new Animated.Value(0);
    });
    setAllMatched(false);
  };

  const handleReset = () => {
    cards.forEach((_, index) => {
      scaleAnims[index].setValue(1);
      shakeAnims[index].setValue(0);
    });
    initializeCards();
    setShowFeedback(false);
  };

  const shakeAnimation = (index: number) => {
    Animated.sequence([
      Animated.timing(shakeAnims[index], {
        toValue: 10,
        duration: ANIMATION_TIMING.SHAKE_DURATION / 4,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: -10,
        duration: ANIMATION_TIMING.SHAKE_DURATION / 4,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: 10,
        duration: ANIMATION_TIMING.SHAKE_DURATION / 4,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: 0,
        duration: ANIMATION_TIMING.SHAKE_DURATION / 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shrinkAnimation = (index: number) => {
    Animated.timing(scaleAnims[index], {
      toValue: 0,
      duration: ANIMATION_TIMING.SHRINK_DURATION,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPress = (card: Card) => {
    if (card.isMatched) return;

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    if (selectedCard.type === card.type) {
      setSelectedCard(card);
      return;
    }

    const cardIndex = cards.findIndex((c) => c.id === card.id);
    const selectedCardIndex = cards.findIndex((c) => c.id === selectedCard.id);

    const isCorrect = question.options.some(
      (opt) =>
        (selectedCard.text === opt.text && card.text === opt.match) ||
        (card.text === opt.text && selectedCard.text === opt.match)
    );

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === card.id || c.id === selectedCard.id) {
          return {
            ...c,
            showFeedback: true,
            isCorrect: isCorrect,
            isMatched: isCorrect,
          };
        }
        return c;
      })
    );

    if (isCorrect) {
      setTimeout(() => {
        shrinkAnimation(cardIndex);
        shrinkAnimation(selectedCardIndex);
      }, ANIMATION_TIMING.FEEDBACK_DURATION);
    } else {
      shakeAnimation(cardIndex);
      shakeAnimation(selectedCardIndex);
    }

    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => {
          if (c.id === card.id || c.id === selectedCard.id) {
            return { ...c, showFeedback: false };
          }
          return c;
        })
      );
    }, ANIMATION_TIMING.FEEDBACK_DURATION);

    setSelectedCard(null);
  };

  const currentSubmissionIndex = submittedAssessments.findIndex(
    (submission) => submission.assessment_id === question.id
  );
  const currentSubmission = submittedAssessments[currentSubmissionIndex];

  useEffect(() => {
    if (currentSubmission) {
      if (quizMode) {
      }
      if (!currentSubmission.isCorrect) {
        setIsWrong(true);
      }
      setValue(currentSubmission.answer[0].text);
      setShowFeedback(true);
    }
  }, [submittedAssessments, currentSubmission, quizMode]);

  useEffect(() => {
    if (cards.length < 1) return;
    const allMatched = cards.every((card) => card.isMatched);
    setAllMatched(allMatched);
    setCorrectnessState(index, allMatched);
    if (allMatched) {
      const answer = createAnswer(question);
      setAnswer(index, answer);
      setShowFeedback(true);
      if (!currentSubmission) {
        submitAssessment(question.id);
      }
    }
  }, [
    cards,
    index,
    setCorrectnessState,
    submitAssessment,
    question.id,
    currentSubmissionIndex,
  ]);

  const renderCard = (card: Card, idx: number, isOriginal: boolean = false) => (
    <Animated.View
      key={card.id}
      style={[
        styles.cardContainer,
        {
          transform: [
            { scale: isOriginal ? 1 : scaleAnims[idx] },
            { translateX: isOriginal ? 0 : shakeAnims[idx] },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => !isOriginal && handleCardPress(card)}
        style={[
          styles.card,
          card.type === "option" ? styles.optionCard : styles.matchCard,
          selectedCard?.id === card.id && styles.selectedCard,
          card.showFeedback && !card.isCorrect && styles.incorrectCard,
          card.showFeedback && card.isCorrect && styles.correctCard,
        ]}
        disabled={card.isMatched || allMatched || isOriginal}
      >
        <Text style={styles.cardText}>{card.text}</Text>
        {card.showFeedback && (
          <View style={styles.feedbackIcon}>
            <StatusIcon
              isCorrect={card.isCorrect}
              isWrong={!card.isCorrect}
              showAnswer={false}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <AssessmentWrapper
      question={question}
      showFeedback={showFeedback}
      setShowFeedback={setShowFeedback}
      quizMode={quizMode}
      isActive={isActive}
      isCorrect={currentSubmission ? currentSubmission.isCorrect : false}
    >
      <View style={styles.mainContainer}>
        <View style={styles.cardsContainer}>
          {allMatched
            ? originalCards.map((card, idx) => renderCard(card, idx, true))
            : cards.map((card, idx) => renderCard(card, idx))}
        </View>
        <IconButton
          icon="refresh"
          mode="contained"
          onPress={handleReset}
          style={styles.resetButton}
        />
      </View>
    </AssessmentWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
  },
  cardsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    padding: 16,
  },
  cardContainer: {
    width: "45%",
    aspectRatio: 1.5,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionCard: {
    backgroundColor: "#FFB74D",
  },
  matchCard: {
    backgroundColor: "#FFFFFF",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  correctCard: {
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  incorrectCard: {
    borderWidth: 2,
    borderColor: "#FF0000",
  },
  cardText: {
    textAlign: "center",
    fontSize: 16,
  },
  feedbackIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  resetButton: {
    marginTop: 16,
  },
});
