import { useState, RefObject, useCallback } from 'react';
import { Message } from './types';

interface ChatWindowProps {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatWindow({
  isOpen,
  messages,
  isTyping,
  onClose,
  onSendMessage,
  messagesEndRef,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');

  const commonQuestions = [
    'How long does shipping take?',
    'What is your return policy?',
    'What payment methods do you accept?',
    'How can I track my order?',
    'Do you have a size guide?',
    'Are there any ongoing sales?',
    'Do you offer international shipping?',
    'How do I change my order?',
    'What is your warranty policy?'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-20 right-0 w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Customer Support</h3>
          <p className="text-sm text-blue-100">We typically reply within minutes</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-700 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs mt-1 opacity-75 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Common Questions */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Common Questions:</p>
        <div className="relative">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-2">
            <div className="flex gap-2 min-w-max px-1">
              {commonQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(question)}
                  className="text-sm whitespace-nowrap px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex-none"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-gray-50 dark:from-gray-800 w-6 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-gray-50 dark:from-gray-800 w-6 pointer-events-none"></div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
