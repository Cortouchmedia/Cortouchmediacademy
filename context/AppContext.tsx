"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Page, Course, User, ChatMessage, CourseWithEnrollment, AuditLog, PayoutRequest, InstructorMessage, Lesson, Webinar } from '../types';
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
  language: 'en' | 'fr' | 'es' | 'de' | 'yo' | 'ha' | 'ig';
  coursesWithEnrollmentStatus: CourseWithEnrollment[];
  filteredCourses: CourseWithEnrollment[];
  auditLogs: AuditLog[];
  payoutRequests: PayoutRequest[];
  instructorMessages: InstructorMessage[];
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
  setLanguage: (lang: 'en' | 'fr' | 'es' | 'de' | 'yo' | 'ha' | 'ig') => void;
  handleLogin: (role?: 'admin' | 'student' | 'instructor') => void;
  handleLogout: () => void;
  handleNavigate: (page: Page) => void;
  handleCourseSelect: (course: Course) => void;
  handleSearchChange: (query: string) => void;
  handleUserUpdate: (updatedUser: User) => void;
  handleUserDelete: (userId: number) => void;
  handleUserAdd: (userData: Omit<User, 'id' | 'enrolledCourseIds'>) => void;
  handleEnrollmentSuccess: (courseId: number) => void;
  handleToggleLessonComplete: (courseId: number, lessonId: number) => void;
  handleProjectSubmit: (courseId: number, projectId: number) => Promise<void>;
  handleSendMessage: (text: string) => Promise<void>;
  handleSendCourseMessage: (courseId: number, text: string) => Promise<void>;
  logAuditEvent: (action: string, details: string, type: AuditLog['type']) => void;
  handleInstructorCourseAdd: (courseData: Omit<Course, 'id' | 'enrollmentCount' | 'rating' | 'progress' | 'completed' | 'reviews' | 'content' | 'projects' | 'webinars'>, initialModules?: { title: string }[]) => void;
  handleInstructorMessageSend: (studentId: number, text: string) => void;
  handlePayoutRequest: (payoutData: Omit<PayoutRequest, 'id' | 'instructorId' | 'status' | 'timestamp'>) => void;
  handleCourseUpdate: (courseId: number, updatedDetails: Partial<Course>) => void;
  handleCourseDelete: (courseId: number) => void;
  handleModuleAdd: (courseId: number, moduleTitle: string) => void;
  handleLessonAdd: (courseId: number, moduleId: number, lessonData: Omit<Lesson, 'id' | 'isCompleted'>) => void;
  handleLessonDelete: (courseId: number, lessonId: number) => void;
  handleWebinarAdd: (courseId: number, webinarData: Omit<Webinar, 'id'>) => void;
  handleWebinarDelete: (courseId: number, webinarId: number) => void;
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
  const [language, setLanguage] = useState<'en' | 'fr' | 'es' | 'de' | 'yo' | 'ha' | 'ig'>('en');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 1, userId: 1, userName: 'Alex Morgan', action: 'System Login', details: 'Admin logged into the system', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'auth' },
    { id: 2, userId: 1, userName: 'Alex Morgan', action: 'User Created', details: 'Created new student account: Jane Doe', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'user' },
    { id: 3, userId: 1, userName: 'Alex Morgan', action: 'Course Published', details: 'Published UI/UX Design Masterclass', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'course' },
  ]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [instructorMessages, setInstructorMessages] = useState<InstructorMessage[]>([]);

  const logAuditEvent = (action: string, details: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: Math.max(...auditLogs.map(l => l.id), 0) + 1,
      userId: currentUser?.id || 0,
      userName: currentUser?.name || 'System',
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

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
    logAuditEvent('Login', `${user.name} logged in as ${role || 'user'}`, 'auth');
    if (role === 'instructor') {
      setCurrentPage('Instructor Dashboard');
    } else if (role === 'admin') {
      setCurrentPage('Admin');
    } else {
      setCurrentPage('Dashboard');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logAuditEvent('Logout', `${currentUser.name} logged out`, 'auth');
    }
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
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    logAuditEvent('User Updated', `Updated user: ${updatedUser.name} (${updatedUser.role})`, 'user');
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleUserDelete = (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      logAuditEvent('User Deleted', `Deleted user: ${userToDelete.name}`, 'user');
    }
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };

  const handleUserAdd = (userData: Omit<User, 'id' | 'enrolledCourseIds'>) => {
    const newUser: User = {
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      enrolledCourseIds: []
    };
    logAuditEvent('User Created', `Created new user: ${newUser.name} as ${newUser.role}`, 'user');
    setUsers(prev => [...prev, newUser]);
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

  const handleInstructorCourseAdd = (courseData: Omit<Course, 'id' | 'enrollmentCount' | 'rating' | 'progress' | 'completed' | 'reviews' | 'content' | 'projects' | 'webinars'>, initialModules?: { title: string }[]) => {
    const newCourse: Course = {
      ...courseData,
      id: Math.max(...courses.map(c => c.id), 0) + 1,
      enrollmentCount: 0,
      rating: 0,
      progress: 0,
      completed: false,
      reviews: [],
      content: initialModules ? initialModules.map((m, i) => ({
        id: i + 1,
        title: m.title,
        lessons: [],
        progress: 0
      })) : [],
      projects: [],
      webinars: []
    };
    setCourses(prev => [...prev, newCourse]);
    logAuditEvent('Course Created', `Instructor ${currentUser?.name} created course: ${newCourse.title}`, 'course');
  };

  const handleCourseUpdate = (courseId: number, updatedDetails: Partial<Course>) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const updated = { ...c, ...updatedDetails };
        if (selectedCourse?.id === courseId) setSelectedCourse(updated);
        if (editingCourse?.id === courseId) setEditingCourse(updated);
        return updated;
      }
      return c;
    }));
    logAuditEvent('Course Updated', `Updated course ID: ${courseId}`, 'course');
  };

  const handleCourseDelete = (courseId: number) => {
    const courseToDelete = courses.find(c => c.id === courseId);
    if (courseToDelete) {
      logAuditEvent('Course Deleted', `Deleted course: ${courseToDelete.title}`, 'course');
    }
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (selectedCourse?.id === courseId) setSelectedCourse(null);
    if (editingCourse?.id === courseId) setEditingCourse(null);
  };

  const handleModuleAdd = (courseId: number, moduleTitle: string) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const newModule = {
          id: Math.max(...course.content.map(m => m.id), 0) + 1,
          title: moduleTitle,
          lessons: [],
          progress: 0
        };
        const updatedCourse = { ...course, content: [...course.content, newModule] };
        if (editingCourse?.id === courseId) setEditingCourse(updatedCourse);
        return updatedCourse;
      }
      return course;
    }));
    logAuditEvent('Module Added', `Added module "${moduleTitle}" to course ID: ${courseId}`, 'course');
  };

  const handleLessonAdd = (courseId: number, moduleId: number, lessonData: Omit<Lesson, 'id' | 'isCompleted'>) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedContent = course.content.map(module => {
          if (module.id === moduleId) {
            const newLesson = {
              ...lessonData,
              id: Math.max(...module.lessons.map(l => l.id), 0) + 1,
              isCompleted: false
            };
            return { ...module, lessons: [...module.lessons, newLesson] };
          }
          return module;
        });
        const updatedCourse = { ...course, content: updatedContent };
        if (editingCourse?.id === courseId) setEditingCourse(updatedCourse);
        return updatedCourse;
      }
      return course;
    }));
    logAuditEvent('Lesson Added', `Added lesson "${lessonData.title}" to module ID: ${moduleId} in course ID: ${courseId}`, 'course');
  };

  const handleLessonDelete = (courseId: number, lessonId: number) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedContent = course.content.map(module => {
          return { ...module, lessons: module.lessons.filter(l => l.id !== lessonId) };
        });
        const updatedCourse = { ...course, content: updatedContent };
        if (editingCourse?.id === courseId) setEditingCourse(updatedCourse);
        return updatedCourse;
      }
      return course;
    }));
    logAuditEvent('Lesson Deleted', `Deleted lesson ID: ${lessonId} from course ID: ${courseId}`, 'course');
  };

  const handleWebinarAdd = (courseId: number, webinarData: Omit<Webinar, 'id'>) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const newWebinar = {
          ...webinarData,
          id: Math.max(...(course.webinars || []).map(w => w.id), 0) + 1,
        };
        const updatedCourse = { ...course, webinars: [...(course.webinars || []), newWebinar] };
        if (editingCourse?.id === courseId) setEditingCourse(updatedCourse);
        return updatedCourse;
      }
      return course;
    }));
    logAuditEvent('Webinar Added', `Added webinar "${webinarData.title}" to course ID: ${courseId}`, 'course');
  };

  const handleWebinarDelete = (courseId: number, webinarId: number) => {
    setCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const updatedCourse = { ...course, webinars: (course.webinars || []).filter(w => w.id !== webinarId) };
        if (editingCourse?.id === courseId) setEditingCourse(updatedCourse);
        return updatedCourse;
      }
      return course;
    }));
    logAuditEvent('Webinar Deleted', `Deleted webinar ID: ${webinarId} from course ID: ${courseId}`, 'course');
  };

  const handleInstructorMessageSend = (studentId: number, text: string) => {
    if (!currentUser) return;
    const newMessage: InstructorMessage = {
      id: Date.now(),
      instructorId: currentUser.id,
      studentId,
      text,
      timestamp: new Date().toISOString()
    };
    setInstructorMessages(prev => [...prev, newMessage]);
    logAuditEvent('Message Sent', `Instructor ${currentUser.name} messaged student ID: ${studentId}`, 'user');
  };

  const handlePayoutRequest = (payoutData: Omit<PayoutRequest, 'id' | 'instructorId' | 'status' | 'timestamp'>) => {
    if (!currentUser) return;
    const newRequest: PayoutRequest = {
      ...payoutData,
      id: Date.now(),
      instructorId: currentUser.id,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setPayoutRequests(prev => [...prev, newRequest]);
    logAuditEvent('Payout Requested', `Instructor ${currentUser.name} requested payout of ${payoutData.amount}`, 'system');
  };

  const value = {
    isLoggedIn, currentUser, users, courses, currentPage, selectedCourse, editingCourse, completedCourse,
    isChatOpen, isBotTyping, messages, searchQuery, language, coursesWithEnrollmentStatus, filteredCourses, auditLogs,
    payoutRequests, instructorMessages,
    setIsLoggedIn, setCurrentUser, setCourses, setCurrentPage, setSelectedCourse, setEditingCourse,
    setCompletedCourse, setIsChatOpen, setIsBotTyping, setMessages, setSearchQuery, setLanguage,
    handleLogin, handleLogout, handleNavigate, handleCourseSelect, handleSearchChange,
    handleUserUpdate, handleUserDelete, handleUserAdd, handleEnrollmentSuccess, handleToggleLessonComplete, handleProjectSubmit,
    handleSendMessage, handleSendCourseMessage, logAuditEvent,
    handleInstructorCourseAdd, handleInstructorMessageSend, handlePayoutRequest,
    handleCourseUpdate, handleCourseDelete, handleModuleAdd, handleLessonAdd, handleLessonDelete, handleWebinarAdd, handleWebinarDelete
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
