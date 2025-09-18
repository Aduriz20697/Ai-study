
import React from 'react';
import type { View } from '../App';
import { APP_NAME } from '../constants';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.02 1.84l7 3.5a1 1 0 00.748 0l7-3.5a1 1 0 00.02-1.84l-7-3.5zM3 9.363l7 3.5v5.072a1 1 0 001.242.97l7-3.5A1 1 0 0019 14.5v-5.137l-7 3.5-7-3.5z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{APP_NAME}</h1>
      </div>
      <nav className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shadow-inner">
        <NavButton label="AI Tutor" isActive={currentView === 'tutor'} onClick={() => setView('tutor')} />
        <NavButton label="Quiz Generator" isActive={currentView === 'quiz'} onClick={() => setView('quiz')} />
      </nav>
    </header>
  );
};

export default Header;
