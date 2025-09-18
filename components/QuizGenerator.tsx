
import React, { useState, useCallback } from 'react';
import { generateQuiz } from '../services/geminiService';
import type { QuizQuestion } from '../types';
import LoadingSpinner from './LoadingSpinner';

const QuestionCard: React.FC<{ question: QuizQuestion; index: number }> = ({ question, index }) => {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  return (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
      <p className="font-semibold text-gray-800 dark:text-gray-200">
        <span className="text-blue-600 dark:text-blue-400 mr-2">{index + 1}.</span>
        {question.question}
      </p>
      {isAnswerVisible && (
        <p className="mt-2 pl-6 text-gray-600 dark:text-gray-300 bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
          {question.answer}
        </p>
      )}
      <button
        onClick={() => setIsAnswerVisible(!isAnswerVisible)}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-3"
      >
        {isAnswerVisible ? 'Hide Answer' : 'Show Answer'}
      </button>
    </div>
  );
};

const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or paste your notes.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuiz(null);

    try {
      const generatedQuiz = await generateQuiz(topic, numQuestions);
      setQuiz(generatedQuiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, numQuestions]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quiz Generator</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Paste your notes or describe a topic below, and we'll create a quiz to help you study.
      </p>

      <div className="space-y-4">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The process of photosynthesis in plants..."
          className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition border border-gray-200 dark:border-gray-600"
        />
        <div className="flex items-center space-x-4">
          <label htmlFor="numQuestions" className="font-medium text-gray-700 dark:text-gray-300">
            Number of questions:
          </label>
          <input
            id="numQuestions"
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10)))}
            min="1"
            max="20"
            className="w-20 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-200 dark:border-gray-600"
          />
        </div>
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate Quiz'}
        </button>
      </div>

      {error && <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">{error}</div>}

      {quiz && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Quiz is Ready!</h3>
          <div className="space-y-4">
            {quiz.map((q, index) => (
              <QuestionCard key={index} question={q} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
