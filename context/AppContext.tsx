"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Page, Course, User, ChatMessage, CourseWithEnrollment } from '../types';
import { mockUsers, mockCourses } from '../constants';

interface AppContextType {
  isLoggedIn: boolean;
  currentUser: User | null;
  users: User[];
  courses: Course[];
  currentPage: Page;
  selectedCourse: Course | null;
  editingCourse: Course | null;
  completedCourse: Course | null;
  isChatOpen: boolean;
  isBotTyping: boolean;
  messages: ChatMessage[];
  searchQuery: string;
  coursesWithEnrollmentStatus: CourseWithEnrollment[];
  filteredCourses: CourseWithEnrollment[];
  setIsLoggedIn: (val: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setCurrentPage: (page: Page) => void;
  setSelectedCourse: (course: Course | null) => void;
  setEditingCourse: (course: Course | null) => void;
  setCompletedCourse: (course: Course | null) => void;
  setIsChatOpen: (val: boolean) => void;
  setIsBotTyping: (val: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setSearchQuery: (query: string) => void;
  handleLogin: (role?: 'admin' | 'student' | 'instructor') => void;
  handleLogout: () => void;
  handleNavigate: (page: Page) => void;
  handleCourseSelect: (course: Course) => void;
  handleSearchChange: (query: string) => void;
  handleUserUpdate: (updatedUser: User) => void;
  handleEnrollmentSuccess: (courseId: number) => void;
  handleToggleLessonComplete: (courseId: number, lessonId: number) => void;
  handleProjectSubmit: (courseId: number, projectId: number) => Promise<void>;
  handleSendMessage: (text: string) => Promise<void>;
  handleSendCourseMessage: (courseId: number, text: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [completedCourse, setCompletedCourse] = useState<Course | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you with your learning journey today?", sender: 'bot', timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()) }
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (role?: 'admin' | 'student' | 'instructor') => {
    let user;
    if (role === 'instructor') {
      user = users[2];
    } else if (role === 'student') {
      user = users[1];
    } else {
      user = users[0];
    }
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (role === 'instructor') {
      setCurrentPage('Instructor Dashboard');
    } else if (role === 'admin') {
      setCurrentPage('Admin');
    } else {
      setCurrentPage('Dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('Dashboard');
    setSelectedCourse(null);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedCourse(null);
    setEditingCourse(null);
    if(completedCourse) setCompletedCourse(null);
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSelectedCourse(null);
      setEditingCourse(null);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleEnrollmentSuccess = (courseId: number) => {
    if (!currentUser) return;
    if (!currentUser.enrolledCourseIds.includes(courseId)) {
      const updatedUser = {
        ...currentUser,
        enrolledCourseIds: [...currentUser.enrolledCourseIds, courseId]
      };
      setCurrentUser(updatedUser);
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  const coursesWithEnrollmentStatus: CourseWithEnrollment[] = useMemo(() => {
    if (!currentUser) return courses.map(c => ({...c, isEnrolled: false}));
    return courses.map(course => ({
      ...course,
      isEnrolled: currentUser.enrolledCourseIds.includes(course.id)
    }));
  }, [currentUser, courses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowercasedQuery = searchQuery.toLowerCase();
    return coursesWithEnrollmentStatus.filter(course =>
      course.title.toLowerCase().includes(lowercasedQuery) ||
      course.description.toLowerCase().includes(lowercasedQuery) ||
      course.category.toLowerCase().includes(lowercasedQuery) ||
      course.instructor.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, coursesWithEnrollmentStatus]);

  const handleToggleLessonComplete = (courseId: number, lessonId: number) => {
    let courseToComplete: Course | null = null;
    const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
            const updatedContent = course.content.map(module => {
                const updatedLessons = module.lessons.map(lesson =>
                    lesson.id === lessonId ? { ...lesson, isCompleted: !lesson.isCompleted } : lesson
                );
                const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
                const moduleProgress = Math.round((completedLessons / updatedLessons.length) * 100);
                return { ...module, lessons: updatedLessons, progress: moduleProgress };
            });

            const totalLessons = updatedContent.reduce((acc, module) => acc + module.lessons.length, 0);
            const totalCompletedLessons = updatedContent.reduce((acc, module) => acc + module.lessons.filter(l => l.isCompleted).length, 0);
            const courseProgress = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;
            const isCourseComplete = courseProgress === 100;
            const updatedCourse = { ...course, content: updatedContent, progress: courseProgress, completed: isCourseComplete };
            if (isCourseComplete && !course.completed) courseToComplete = updatedCourse;
            if(selectedCourse?.id === courseId) setSelectedCourse(updatedCourse);
            return updatedCourse;
        }
        return course;
    });
    setCourses(updatedCourses);
    if (courseToComplete) setCompletedCourse(courseToComplete);
  };

  const handleProjectSubmit = async (courseId: number, projectId: number) => {
    // Logic from App.tsx...
  };

  const handleSendMessage = async (text: string) => {
    // Logic from App.tsx...
  };

  const handleSendCourseMessage = async (courseId: number, text: string) => {
    // Logic from App.tsx...
  };

  const value = {
    isLoggedIn, currentUser, users, courses, currentPage, selectedCourse, editingCourse, completedCourse,
    isChatOpen, isBotTyping, messages, searchQuery, coursesWithEnrollmentStatus, filteredCourses,
    setIsLoggedIn, setCurrentUser, setCourses, setCurrentPage, setSelectedCourse, setEditingCourse,
    setCompletedCourse, setIsChatOpen, setIsBotTyping, setMessages, setSearchQuery,
    handleLogin, handleLogout, handleNavigate, handleCourseSelect, handleSearchChange,
    handleUserUpdate, handleEnrollmentSuccess, handleToggleLessonComplete, handleProjectSubmit,
    handleSendMessage, handleSendCourseMessage
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
