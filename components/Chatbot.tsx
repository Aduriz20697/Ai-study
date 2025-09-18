import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatResponseStream, resetChatInstance } from '../services/geminiService';
import type { ChatMessage } from '../types';
import MessageBox from './MessageBox';
import TypingIndicator from './TypingIndicator';

const CHAT_HISTORY_KEY = 'learnmate-chat-history';
const INITIAL_MESSAGE: ChatMessage = { id: 'initial', sender: 'ai', text: "Hello! I'm LearnMate. How can I help you study today?" };

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load history on initial component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setMessages(parsedHistory);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      localStorage.removeItem(CHAT_HISTORY_KEY); // Clear potentially corrupted data
    }
  }, []);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    // Only save if there's an actual conversation (more than the initial message)
    if (messages.length > 1) {
      try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    }
  }, [messages]);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNewChat = useCallback(() => {
    if (isLoading) return;
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    resetChatInstance();
  }, [isLoading]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let aiMessageId = '';
    try {
      const stream = await getChatResponseStream(input);
      let isFirstChunk = true;

      for await (const chunk of stream) {
        if (isFirstChunk) {
          aiMessageId = (Date.now() + 1).toString();
          // Add a new AI message bubble with the first chunk of text
          setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: chunk.text }]);
          isFirstChunk = false;
        } else {
          // Append subsequent chunks to the existing AI message
          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            if (lastIndex >= 0 && newMessages[lastIndex].id === aiMessageId) {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                text: newMessages[lastIndex].text + chunk.text,
              };
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: `Sorry, something went wrong: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator = isLoading && (!lastMessage || lastMessage.sender === 'user');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col h-[75vh]">
      <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBox key={msg.id} message={msg} />
        ))}
        {showTypingIndicator && <TypingIndicator />}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={isLoading}
            className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full p-3 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Start new chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your topic..."
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-transform transform active:scale-95"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;