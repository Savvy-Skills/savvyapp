import { useState } from 'react';

interface EvaluationResult {
  is_correct: boolean;
  rating: number;
  feedback: string;
  reasoning: string;
  max_score: number;
}

interface UseAnswerEvaluationReturn {
  evaluate: (question: string, answer: string) => Promise<void>;
  result: EvaluationResult | null;
  loading: boolean;
  error: string | null;
}

export default function useAnswerEvaluation(): UseAnswerEvaluationReturn {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = async (question: string, answer: string) => {
    if (!question.trim() || !answer.trim()) {
      setError("Please enter both a question and an answer");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("https://backendtest-production-2cac.up.railway.app/evaluate", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question,
          answer
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred during evaluation");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to connect to evaluation service");
    } finally {
      setLoading(false);
    }
  };

  return { evaluate, result, loading, error };
} 