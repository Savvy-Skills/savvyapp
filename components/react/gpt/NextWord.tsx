'use dom'

import React, { useState, useCallback, useMemo, memo } from "react";
import "./NextWordGame.css";
import ExpandableFact from "../ui/ExpandableFact";
import StepCard from "../ui/StepCard";
// Memoized component for the prediction words
const PredictionWord = memo(({ word, onClick }: { word: string, onClick: (word: string) => void }) => (
  <button
    onClick={() => onClick(word)}
    className="nextword-word-button"
  >
    {word}
  </button>
));

// Memoized component for the full sentence button
const FullSentenceButton = memo(({ 
  predictions, 
  onClick 
}: { 
  predictions: string[], 
  onClick: () => void 
}) => (
  <div className="nextword-full-sentence">
    <h2 className="nextword-predictions-title">Or add the whole prediction:</h2>
    <button
      onClick={onClick}
      className="nextword-sentence-button"
    >
      ➕ "{predictions.join(" ")}"
    </button>
  </div>
));

// Memoized component for the settings
const SettingsControl = memo(({ 
  maxTokens, 
  setMaxTokens 
}: { 
  maxTokens: number, 
  setMaxTokens: (value: number) => void 
}) => (
  <div className="nextword-settings">
    <div className="nextword-settings-row">
      <label className="nextword-label">Max Tokens:
        <input 
          type="number" 
          min="1" 
          max="20" 
          value={maxTokens} 
          onChange={e => setMaxTokens(+e.target.value)} 
          className="nextword-number-input" 
        />
      </label>
      <span className="nextword-hint">🔢 Number of words the model should try to generate.</span>
    </div>
  </div>
));

// Collapsible prompts component
const PromptSuggestions = memo(({ 
  isExpanded, 
  onToggle,
  onSelectPrompt 
}: { 
  isExpanded: boolean;
  onToggle: () => void;
  onSelectPrompt: (prompt: string) => void;
}) => {
  // Example prompts
  const examplePrompts = [
    "Once upon a time in a magical",
    "The secret to happiness is",
    "In the future, computers will",
    "The most interesting fact about space is",
    "If I could travel anywhere, I would go to",
    "The best thing about learning is"
  ];

  return (
    <div className="nextword-prompt-suggestions">
      <button 
        className="nextword-suggestions-toggle"
        onClick={onToggle}
      >
        {isExpanded ? '▼ Hide Example Prompts' : '▶ Show Example Prompts'}
      </button>
      
      {isExpanded && (
        <div className="nextword-examples-container">
          <ul className="nextword-examples">
            {examplePrompts.map((prompt, index) => (
              <li 
                key={index}
                onClick={() => onSelectPrompt(prompt)}
              >
                "{prompt}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

// The main component
export default function GPTNextWordGame() {
  const [input, setInput] = useState("Once upon a time");
  const [predictions, setPredictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxTokens, setMaxTokens] = useState(5);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);

  // Use useCallback for event handlers
  const handlePredict = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    setLoading(true);
    setPredictions([]);

    try {
      const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: trimmedInput,
          parameters: {
            return_full_text: false,
            max_new_tokens: maxTokens,
            do_sample: true
          }
        }),
      });

      const result = await response.json();
      const generated = result[0]?.generated_text || "";
      const newWords = generated.replace(trimmedInput, "").trim().split(" ");
      setPredictions(newWords);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setLoading(false);
    }
  }, [input, maxTokens]);

  const handleWordClick = useCallback((word: string) => {
    setInput(prev => prev + " " + word);
    setPredictions(prev => prev.filter(w => w !== word));
  }, []);

  const handleFullSentenceClick = useCallback(() => {
    const sentence = predictions.join(" ");
    setInput(prev => prev + " " + sentence);
    setPredictions([]);
  }, [predictions]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const togglePromptSuggestions = useCallback(() => {
    setShowPromptSuggestions(prev => !prev);
  }, []);

  const handleSelectPrompt = useCallback((prompt: string) => {
    setInput(prompt);
    setPredictions([]);
  }, []);

  // Memoize the predictions component to prevent unnecessary re-renders
  const predictionsSection = useMemo(() => {
    if (loading || predictions.length === 0) return null;
    
    return (
      <div className="nextword-predictions">
        <div>
          <h2 className="nextword-predictions-title">Suggested Words (click to add one):</h2>
          <div className="nextword-predictions-list">
            {predictions.map((word, idx) => (
              <PredictionWord 
                key={idx} 
                word={word} 
                onClick={handleWordClick} 
              />
            ))}
          </div>
        </div>
        <FullSentenceButton 
          predictions={predictions} 
          onClick={handleFullSentenceClick} 
        />
      </div>
    );
  }, [predictions, loading, handleWordClick, handleFullSentenceClick]);

  // Memoize the button text based on loading state
  const buttonText = useMemo(() => loading ? "Loading..." : "Predict Next Words", [loading]);
  
  // Memoize the button disabled state
  const buttonDisabled = useMemo(() => 
    loading || !input.trim(), 
    [loading, input]
  );

  return (
    <div className="lesson-container">
      <h1 className="lesson-title">Explore How Computers Predict Text</h1>
      
      <StepCard 
        stepNumber={1} 
        title="How Computers Predict Text"
        stepNumberStyle={{ whiteSpace: 'nowrap', minWidth: '60px', flexShrink: 0 }}
        titleStyle={{ flexGrow: 1, hyphens: 'auto', overflowWrap: 'break-word' }}
      >
        <p>
          Computers can predict what words might come next in a sentence by analyzing patterns in language. 
          Try typing a sentence below and see what the computer predicts should come next!
        </p>
        
        <p className="nextword-example-prompt-label">Need inspiration? Click on one of these examples:</p>
        
        <PromptSuggestions 
          isExpanded={showPromptSuggestions} 
          onToggle={togglePromptSuggestions}
          onSelectPrompt={handleSelectPrompt}
        />
        
        <textarea
          className="nextword-textarea"
          rows={3}
          value={input}
          onChange={handleInputChange}
          placeholder="Start typing a sentence..."
        />

        <SettingsControl maxTokens={maxTokens} setMaxTokens={setMaxTokens} />

        <div className="nextword-button-container">
          <button
            className="nextword-button primary full-width"
            onClick={handlePredict}
            disabled={buttonDisabled}
          >
            {buttonText}
          </button>
        </div>

        {predictionsSection}

        <ExpandableFact
          title="How Text Prediction Works"
          emoji="🧠"
          color="var(--info-color)"
        >
          <p>
            Modern text prediction systems like GPT-2 analyze millions of text examples to learn 
            patterns in language. They don't truly understand meaning but can generate convincing 
            text by predicting which words are likely to appear next in a sequence.
          </p>
        </ExpandableFact>
      </StepCard>

    </div>
  );
}
