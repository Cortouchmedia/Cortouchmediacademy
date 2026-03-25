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
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={`text-xs mt-1 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>{message.timestamp}</p>
      </div>
    </div>
  );
};


export const InstructorAssistant: React.FC<InstructorAssistantProps> = ({ course, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [course.chatHistory, course.isAssistantTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSendMessage(course.id, inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-brand-bg rounded-lg border border-slate-200">
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {(course.chatHistory || []).map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {course.isAssistantTyping && (
                    <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
                            <Icon name="academicCap" className="w-5 h-5 text-white" />
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
            <div className="p-4 bg-brand-surface rounded-b-lg flex-shrink-0 border-t border-slate-200/80">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about this course..."
                        className="flex-1 bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-full py-2 px-4 text-gray-900 placeholder-brand-muted text-sm transition"
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
    );
};
