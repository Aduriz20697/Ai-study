
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import QuizGenerator from './components/QuizGenerator';

export type View = 'tutor' | 'quiz';

const App: React.FC = () => {
  const [view, setView] = useState<View>('tutor');

  const renderView = useCallback(() => {
    switch (view) {
      case 'tutor':
        return <Chatbot />;
      case 'quiz':
        return <QuizGenerator />;
      default:
        return <Chatbot />;
    }
  }, [view]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 text-gray-800 dark:text-gray-200 font-sans">
      <div className="container mx-auto p-4 max-w-4xl">
        <Header currentView={view} setView={setView} />
        <main className="mt-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
