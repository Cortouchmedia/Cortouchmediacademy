
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { Icon } from './Icon';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  // FIX: Add isBotTyping prop to show a typing indicator.
  isBotTyping?: boolean;
}

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
          <Icon name="courses" className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md rounded-2xl p-3 shadow-sm ${
          isUser
            ? 'bg-brand-primary text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs mt-1 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>{message.timestamp}</p>
      </div>
    </div>
  );
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onToggle, messages, onSendMessage, isBotTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isBotTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <>
      <div className={`fixed bottom-0 right-0 m-6 z-40 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <button
          onClick={onToggle}
          className="bg-brand-primary text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform"
          aria-label="Open chat"
        >
          <Icon name="messageSquare" className="w-8 h-8" />
        </button>
      </div>

      <div className={`fixed bottom-0 right-0 md:m-6 z-50 w-full h-full md:w-96 md:h-auto md:max-h-[calc(100vh-3rem)] bg-brand-surface rounded-lg shadow-2xl flex flex-col transition-all duration-300 ease-out border border-gray-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        {/* Header */}
        <header className="bg-brand-surface p-4 flex items-center justify-between rounded-t-lg flex-shrink-0 border-b border-gray-200">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
                    <Icon name="courses" className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Live Support</h3>
                    <p className="text-xs text-brand-accent">Online</p>
                </div>
            </div>
            <button onClick={onToggle} className="text-brand-muted hover:text-gray-900" aria-label="Close chat">
                <Icon name="chevronDown" className="w-6 h-6" />
            </button>
        </header>
        
        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-brand-bg">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {/* FIX: Add a typing indicator for when the bot is generating a response. */}
          {isBotTyping && (
             <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="courses" className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-xs md:max-w-md rounded-2xl p-3 shadow-sm bg-gray-200 text-gray-800 rounded-bl-none">
                  <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 bg-brand-surface rounded-b-lg flex-shrink-0 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-brand-bg border border-gray-200 focus:border-brand-primary focus:ring-0 rounded-full py-2 px-4 text-gray-900 placeholder-brand-muted text-sm transition"
            />
            <button
              type="submit"
              className="bg-brand-primary text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center disabled:opacity-50"
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <Icon name="send" className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
