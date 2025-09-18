
import React from 'react';
import type { ChatMessage } from '../types';

interface MessageBoxProps {
  message: ChatMessage;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const wrapperClasses = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-lg lg:max-w-xl px-4 py-3 rounded-2xl shadow ${
    isUser
      ? 'bg-blue-600 text-white'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }`;

  return (
    <div className={wrapperClasses}>
      <div className={bubbleClasses}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBox;
