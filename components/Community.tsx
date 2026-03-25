"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import type { CommunityTopic, CommunityMessage } from '../types';

const mockTopics: CommunityTopic[] = [
    {
        id: 1,
        title: "UI/UX Design Feedback",
        messages: [
            { id: 1, text: "Hey everyone, can I get some feedback on my latest project design?", author: "Chris Evans", avatarUrl: "https://picsum.photos/seed/user1/40/40", timestamp: "10:30 AM", isCurrentUser: false },
            { id: 2, text: "Sure, I'd be happy to take a look! Post a screenshot.", author: "Sarah Lee", avatarUrl: "https://picsum.photos/seed/user2/40/40", timestamp: "10:32 AM", isCurrentUser: false },
            { id: 3, text: "Looks great! The color palette is very modern. Maybe increase the font size on the headings?", author: "Alex Morgan", avatarUrl: "https://picsum.photos/seed/user-avatar/100/100", timestamp: "10:35 AM", isCurrentUser: true },
        ]
    },
    {
        id: 2,
        title: "Python Data Analytics Help",
        messages: [
            { id: 1, text: "I'm stuck on cleaning this dataset with Pandas. Any tips?", author: "Mike Ross", avatarUrl: "https://picsum.photos/seed/user3/40/40", timestamp: "11:00 AM", isCurrentUser: false },
        ]
    },
    {
        id: 3,
        title: "General Discussion",
        messages: []
    }
];

const Message: React.FC<{ message: CommunityMessage }> = ({ message }) => {
    const isCurrentUser = message.isCurrentUser;
    return (
        <div className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            <img src={message.avatarUrl} alt={message.author} className="w-8 h-8 rounded-full"/>
            <div className="flex flex-col">
                 <div className={`flex items-baseline gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    <span className="font-bold text-sm text-slate-800">{message.author}</span>
                    <span className="text-xs text-brand-muted">{message.timestamp}</span>
                </div>
                <div className={`max-w-md rounded-lg p-3 mt-1 ${isCurrentUser ? 'bg-brand-primary text-white' : 'bg-white border border-gray-200 text-slate-800'}`}>
                    <p className="text-sm">{message.text}</p>
                </div>
            </div>
        </div>
    );
};

export const Community: React.FC = () => {
    const [topics, setTopics] = useState<CommunityTopic[]>(mockTopics);
    const [activeTopicId, setActiveTopicId] = useState<number>(1);
    const [newMessage, setNewMessage] = useState('');
    const [showNewTopicForm, setShowNewTopicForm] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeTopic = topics.find(t => t.id === activeTopicId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeTopic?.messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeTopic) return;
        
        const message: CommunityMessage = {
            id: Date.now(),
            text: newMessage,
            author: "Alex Morgan",
            avatarUrl: "https://picsum.photos/seed/user-avatar/100/100",
            timestamp: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date()),
            isCurrentUser: true,
        };

        const updatedTopics = topics.map(topic => 
            topic.id === activeTopicId 
                ? { ...topic, messages: [...topic.messages, message] }
                : topic
        );
        setTopics(updatedTopics);
        setNewMessage('');
    };

    const handleAddTopic = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicName.trim()) return;

        const newTopic: CommunityTopic = {
            id: Date.now(),
            title: newTopicName,
            messages: []
        };
        setTopics([...topics, newTopic]);
        setActiveTopicId(newTopic.id);
        setNewTopicName('');
        setShowNewTopicForm(false);
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Community Chat</h1>
                <p className="text-brand-muted mt-1">Connect with learners and instructors in real-time.</p>
            </div>
            <div className="flex-1 flex bg-brand-surface rounded-lg border border-gray-200 overflow-hidden">
                {/* Topics Sidebar */}
                <aside className="w-1/4 min-w-[250px] bg-brand-bg border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-800">Topics</h2>
                            <button 
                                onClick={() => setShowNewTopicForm(!showNewTopicForm)}
                                className="p-1 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-md"
                                aria-label="Add new topic"
                            >
                                <Icon name="plus" className="w-5 h-5" />
                            </button>
                        </div>
                        {showNewTopicForm && (
                            <form onSubmit={handleAddTopic} className="mt-3 flex gap-2">
                                <input 
                                    type="text"
                                    value={newTopicName}
                                    onChange={(e) => setNewTopicName(e.target.value)}
                                    placeholder="New topic name..."
                                    className="flex-1 bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-md py-1 px-2 text-sm"
                                />
                                <button type="submit" className="px-2 py-1 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-opacity-80">Add</button>
                            </form>
                        )}
                    </div>
                    <nav className="flex-1 overflow-y-auto p-2">
                        {topics.map(topic => (
                            <button
                                key={topic.id}
                                onClick={() => setActiveTopicId(topic.id)}
                                className={`w-full text-left p-2 rounded-md font-medium text-sm transition-colors ${
                                    activeTopicId === topic.id 
                                    ? 'bg-brand-primary/10 text-brand-primary' 
                                    : 'text-slate-700 hover:bg-gray-200'
                                }`}
                            >
                                # {topic.title}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Chat Window */}
                <main className="flex-1 flex flex-col">
                    {!activeTopic ? (
                        <div className="flex-1 flex items-center justify-center text-brand-muted">Select a topic to start chatting</div>
                    ) : (
                        <>
                            <header className="p-4 border-b border-gray-200">
                                <h3 className="font-bold text-lg text-slate-900"># {activeTopic.title}</h3>
                            </header>
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                                {activeTopic.messages.map(msg => <Message key={msg.id} message={msg} />)}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Message #${activeTopic.title}`}
                                        className="flex-1 bg-brand-bg border border-gray-200 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-gray-900 placeholder-brand-muted text-sm transition"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-brand-primary text-white w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center disabled:opacity-50"
                                        disabled={!newMessage.trim()}
                                        aria-label="Send message"
                                    >
                                        <Icon name="send" className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};