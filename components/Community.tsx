"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { Api, authStorage } from '../lib/api';
import { useAppContext } from '../context/AppContext';

interface CommunityMessage {
  id: string;
  text: string;
  author: string;
  avatarUrl: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface CommunityTopic {
  id: string;
  title: string;
  messages: CommunityMessage[];
  loaded?: boolean;
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(d);
}

function mapReply(r: any, currentUserId?: string): CommunityMessage {
  return {
    id: String(r.id),
    text: r.content ?? r.text ?? '',
    author: r.user?.full_name ?? 'Unknown',
    avatarUrl:
      r.user?.profile_picture ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        r.user?.full_name ?? 'User',
      )}&background=random`,
    timestamp: formatTime(r.created_at),
    isCurrentUser: String(r.user_id) === String(currentUserId),
  };
}

const Message: React.FC<{ message: CommunityMessage }> = ({ message }) => {
  const isCurrentUser = message.isCurrentUser;
  return (
    <div className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <img src={message.avatarUrl} alt={message.author} className="w-8 h-8 rounded-full" />
      <div className="flex flex-col">
        <div className={`flex items-baseline gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
          <span className="font-bold text-sm text-slate-800">{message.author}</span>
          <span className="text-xs text-brand-muted">{message.timestamp}</span>
        </div>
        <div
          className={`max-w-md rounded-lg p-3 mt-1 ${
            isCurrentUser
              ? 'bg-brand-primary text-white'
              : 'bg-white border border-gray-200 text-slate-800'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export const Community: React.FC = () => {
  const { currentUser } = useAppContext();

  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeTopic = topics.find((t) => t.id === activeTopicId) ?? null;

  // Load topics on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingTopics(true);
    setError(null);

    Api.forum
      .topics({ sort: 'newest' })
      .then((res: any) => {
        if (cancelled) return;
        const list = Array.isArray(res?.topics) ? res.topics : [];
        const mapped: CommunityTopic[] = list.map((t: any) => ({
          id: String(t.id),
          title: t.title ?? 'Untitled',
          messages: [],
          loaded: false,
        }));
        setTopics(mapped);
        if (mapped.length > 0) setActiveTopicId(mapped[0].id);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message ?? 'Failed to load topics');
      })
      .finally(() => {
        if (!cancelled) setLoadingTopics(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Load replies when the active topic changes
  useEffect(() => {
    if (!activeTopicId) return;
    const topic = topics.find((t) => t.id === activeTopicId);
    if (!topic || topic.loaded) return;

    let cancelled = false;
    setLoadingReplies(true);

    Api.forum
  .getTopic(activeTopicId, authStorage.getToken() ?? undefined)
      .then((res: any) => {
        if (cancelled) return;
        const messages = (res?.replies ?? []).map((r: any) =>
          mapReply(r, currentUser?.id),
        );
        setTopics((prev) =>
          prev.map((t) =>
            t.id === activeTopicId ? { ...t, messages, loaded: true } : t,
          ),
        );
      })
      .catch((err: any) => {
        if (cancelled) return;
        console.warn('Failed to load replies:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingReplies(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTopicId, currentUser?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTopic?.messages?.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTopic || !currentUser) return;

    const token = authStorage.getToken();
    if (!token) {
      setError('You must be signed in to send messages');
      return;
    }

    const text = newMessage.trim();
    setSending(true);
    setError(null);

    const optimistic: CommunityMessage = {
      id: `temp-${Date.now()}`,
      text,
      author: currentUser.name,
      avatarUrl:
        currentUser.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`,
      timestamp: formatTime(new Date().toISOString()),
      isCurrentUser: true,
    };

    setTopics((prev) =>
      prev.map((t) =>
        t.id === activeTopicId
          ? { ...t, messages: [...t.messages, optimistic] }
          : t,
      ),
    );
    setNewMessage('');

    try {
      await Api.forum.createReply(activeTopicId, { content: text }, token);

      const res: any = await Api.forum.getTopic(activeTopicId, token);
      const messages = (res?.replies ?? []).map((r: any) =>
        mapReply(r, currentUser.id),
      );
      setTopics((prev) =>
        prev.map((t) =>
          t.id === activeTopicId ? { ...t, messages, loaded: true } : t,
        ),
      );
    } catch (err: any) {
      console.error('Failed to send reply:', err);
      setError(err?.message ?? 'Failed to send message');
      setTopics((prev) =>
        prev.map((t) =>
          t.id === activeTopicId
            ? { ...t, messages: t.messages.filter((m) => m.id !== optimistic.id) }
            : t,
        ),
      );
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !currentUser) return;

    const token = authStorage.getToken();
    if (!token) {
      setError('You must be signed in to create a topic');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const created: any = await Api.forum.createTopic(
        {
          title: newTopicName.trim(),
          content: newTopicContent.trim() || newTopicName.trim(),
        },
        token,
      );

      const newTopic: CommunityTopic = {
        id: String(created?.id ?? Date.now()),
        title: created?.title ?? newTopicName.trim(),
        messages: [],
        loaded: false,
      };

      setTopics((prev) => [newTopic, ...prev]);
      setActiveTopicId(newTopic.id);
      setNewTopicName('');
      setNewTopicContent('');
      setShowNewTopicForm(false);
    } catch (err: any) {
      console.error('Failed to create topic:', err);
      setError(err?.message ?? 'Failed to create topic');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Community Chat</h1>
        <p className="text-brand-muted mt-1">
          Connect with learners and instructors in real-time.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex-1 flex bg-brand-surface rounded-lg border border-gray-200 overflow-hidden">
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
              <form onSubmit={handleAddTopic} className="mt-3 space-y-2">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="New topic name..."
                  className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-md py-1 px-2 text-sm"
                  required
                />
                <textarea
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-md py-1 px-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-2 py-1 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-opacity-80 disabled:opacity-50"
                >
                  {sending ? 'Creating…' : 'Create Topic'}
                </button>
              </form>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {loadingTopics ? (
              <p className="p-3 text-sm text-brand-muted">Loading topics…</p>
            ) : topics.length === 0 ? (
              <p className="p-3 text-sm text-brand-muted italic">
                No topics yet. Create the first one!
              </p>
            ) : (
              topics.map((topic) => (
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
              ))
            )}
          </nav>
        </aside>

        <main className="flex-1 flex flex-col">
          {!activeTopic ? (
            <div className="flex-1 flex items-center justify-center text-brand-muted">
              Select a topic to start chatting
            </div>
          ) : (
            <>
              <header className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-lg text-slate-900">
                  # {activeTopic.title}
                </h3>
              </header>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                {loadingReplies ? (
                  <p className="text-sm text-brand-muted">Loading replies…</p>
                ) : activeTopic.messages.length === 0 ? (
                  <p className="text-sm text-brand-muted italic">
                    No replies yet. Be the first to say something!
                  </p>
                ) : (
                  activeTopic.messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                  ))
                )}
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
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="bg-brand-primary text-white w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center disabled:opacity-50"
                    disabled={!newMessage.trim() || sending}
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