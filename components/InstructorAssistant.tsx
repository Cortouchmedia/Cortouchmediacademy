"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Course, ChatMessage } from '../types';
import { Icon } from './Icon';

interface InstructorAssistantProps {
    course: Course;
    onSendMessage: (courseId: number, text: string) => void;
}

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Function to render text with bold formatting
  const renderMessage = (text: string) => {
    if (!text) return null;
    
    // Handle **bold** formatting
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-bold">{boldText}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };
  
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
          <Icon name="academicCap" className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md rounded-2xl p-3 shadow-sm ${
          isUser
            ? 'bg-brand-primary text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {isUser ? message.text : renderMessage(message.text)}
        </p>
        <p className={`text-xs mt-1 opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <Icon name="user" className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
};

export const InstructorAssistant: React.FC<InstructorAssistantProps> = ({ course, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');
    const [localChatHistory, setLocalChatHistory] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync with course chat history
    useEffect(() => {
        if (course.chatHistory) {
            setLocalChatHistory(course.chatHistory);
        }
    }, [course.chatHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [localChatHistory, course.isAssistantTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            // Add user message immediately for better UX
            const userMessage: ChatMessage = {
                id: Date.now(),
                text: inputValue,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString(),
            };
            setLocalChatHistory(prev => [...prev, userMessage]);
            onSendMessage(course.id, inputValue);
            setInputValue('');
            
            // Keep focus
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-brand-bg rounded-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Icon name="academicCap" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold">AI Assistant</h3>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-brand-bg">
                {localChatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Icon name="academicCap" className="w-8 h-8 text-brand-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Welcome! 👋</h4>
                        <p className="text-gray-600 text-sm">
                            Ask me anything about {course.title}
                        </p>
                    </div>
                )}
                
                {localChatHistory.map((msg, index) => (
                    <MessageBubble key={msg.id || index} message={msg} />
                ))}
                
                {course.isAssistantTyping && (
                    <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
                            <Icon name="academicCap" className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-xs md:max-w-md rounded-2xl p-3 shadow-sm bg-gray-200 text-gray-800 rounded-bl-none">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-brand-surface rounded-b-lg flex-shrink-0 border-t border-slate-200/80">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Ask about ${course.title}...`}
                        className="flex-1 bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-full py-2 px-4 text-gray-900 placeholder-brand-muted text-sm outline-none transition"
                    />
                    <button
                        type="submit"
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={!inputValue.trim()}
                        aria-label="Send message"
                    >
                        <Icon name="send" className="w-5 h-5" />
                    </button>
                </form>
                <p className="text-xs text-brand-muted mt-2 text-center">
                    Ask about course content, prerequisites, or what you'll learn
                </p>
            </div>
        </div>
    );
};