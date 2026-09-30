"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Page, Course, User, ChatMessage, CourseWithEnrollment, AuditLog, PayoutRequest, InstructorMessage, Lesson, Webinar } from '../types';
import { Api, authStorage, api } from '../lib/api';

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
  isHydrated: boolean;
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
  handleLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  handleLogout: () => void;
  handleNavigate: (page: Page) => void;
  handleCourseSelect: (course: Course) => void;
  handleSearchChange: (query: string) => void;
  handleUserUpdate: (updatedUser: User) => void;
  handleUserDelete: (userId: string) => void;
  handleUserAdd: (userData: Omit<User, 'id' | 'enrolledCourseIds'>) => void;
  handleEnrollmentSuccess: (courseId: number | string) => Promise<void>;
  handleToggleLessonComplete: (courseId: number | string, lessonId: number | string) => void;
  handleLessonProgressToggle: (lessonId: string | number, isCompleted: boolean) => Promise<void>;
  handleProjectSubmit: (courseId: number | string, projectId: number | string, submissionLink: string) => Promise<void>;
  handleSendMessage: (text: string) => Promise<void>;
  handleSendCourseMessage: (courseId: number | string, text: string) => Promise<void>;
  logAuditEvent: (action: string, details: string, type: AuditLog['type']) => void;
  handleInstructorCourseAdd: (
    courseData: Omit<Course, 'id' | 'enrollmentCount' | 'rating' | 'progress' | 'completed' | 'reviews' | 'content' | 'projects' | 'webinars'>,
    initialModules?: { title: string }[],
  ) => Promise<void>;
  handleInstructorMessageSend: (studentId: string, text: string) => void;
  handlePayoutRequest: (payoutData: Omit<PayoutRequest, 'id' | 'instructorId' | 'status' | 'timestamp'>) => void;
  handleCourseUpdate: (courseId: number | string, updatedDetails: Partial<Course>) => Promise<void>;
  handleCourseDelete: (courseId: number | string) => Promise<void>;
  handleModuleAdd: (courseId: number | string, moduleTitle: string) => Promise<{ id: string | number; title: string } | null>;
  handleLessonAdd: (
    courseId: number | string,
    moduleId: number | string,
    lessonData: Omit<Lesson, 'id' | 'isCompleted'> & {
      description?: string;
      durationMinutes?: number;
      isFree?: boolean;
    },
  ) => Promise<void>;
  handleLessonDelete: (courseId: number | string, lessonId: number | string) => Promise<void>;
  handleWebinarAdd: (courseId: number | string, webinarData: Omit<Webinar, 'id'>) => void;
  handleWebinarDelete: (courseId: number | string, webinarId: number | string) => void;
  handleWebinarRegister: (webinarId: string | number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ai = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })
  : null;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [completedCourse, setCompletedCourse] = useState<Course | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you with your learning journey today?", sender: 'bot', timestamp: '--:--' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'fr' | 'es' | 'de' | 'yo' | 'ha' | 'ig'>('en');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [instructorMessages, setInstructorMessages] = useState<InstructorMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydrate from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist currentUser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentUser) {
      localStorage.setItem('auth_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);


  const normalizeCourse = (raw: any): Course => {
    const safeArray = (v: any): any[] => (Array.isArray(v) ? v : []);
  
    return {
      id: raw.id,
      title: raw.title ?? '',
      description: raw.description ?? '',
      category: raw.category ?? 'General',
      instructor:
        raw.instructor?.full_name ??
        raw.instructor_name ??
        raw.instructor_id ??
        'Unknown instructor',
      instructor_id: raw.instructor_id ?? undefined,
      duration: raw.duration ?? 'Self-paced',
      imageUrl: raw.image_url ?? raw.cover_url ?? '',
      price: Number(raw.price ?? 0) || 0,
      rating: Number(raw.rating ?? 0) || 0,
      enrollmentCount: Number(raw.total_rating_count ?? 0) || 0,
      modules: Array.isArray(raw.modules) ? raw.modules.length : 0,
      content: (safeArray(raw.content).length > 0 ? safeArray(raw.content) : safeArray(raw.modules)).map((m: any) => ({
        ...m,
        lessons: (m.lessons ?? []).map((l: any) => ({
          ...l,
          type: l.video_url ? 'video' : 'text',
          videoUrl: l.video_url ?? l.videoUrl ?? '',
          content: l.text_content ?? l.content ?? '',
          duration: l.video_duration ? `${l.video_duration} min` : (l.duration ?? ''),
          isCompleted: l.isCompleted ?? false,
        })),
      })),
      projects: safeArray(raw.projects),
      progress: 0,
      completed: false,
      reviews: safeArray(raw.reviews),
      webinars: safeArray(raw.webinars),
      instructorBio: raw.instructorBio ?? '',
      whatYouWillLearn: safeArray(raw.whatYouWillLearn),
      requirements: safeArray(raw.requirements),
      features: safeArray(raw.features),
      prerequisiteCourseIds: safeArray(raw.prerequisiteCourseIds),
    };
  };
  // Load courses + apply enrollment progress — sequential, no race
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isLoggedIn || !currentUser?.id) return;
    const token = authStorage.getToken();
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
      
        const coursesData: any = await Api.courses.list();
        const courseList = Array.isArray(coursesData)
          ? coursesData
          : coursesData?.data ?? coursesData?.courses ?? [];
        const normalizedCourses = courseList.map(normalizeCourse);

        
        const enrollmentsData: any = await Api.courses.userEnrollments(
          currentUser.id,
          token,
        );
        const enrollList = Array.isArray(enrollmentsData)
          ? enrollmentsData
          : enrollmentsData?.data ?? [];

        const enrolledIds = enrollList.map((e: any) => String(e.course_id));
        const meta: Record<string, { progress: number; completed: boolean }> =
          {};
        enrollList.forEach((e: any) => {
          const cid = String(e.course_id);
          const pct = Math.round(Number(e.progress_percentage ?? 0));
          meta[cid] = {
            progress: pct,
            completed: pct >= 100 || !!e.completed_at,
          };
        });

      
        const coursesWithProgress = normalizedCourses.map((c: any) => {
          const m = meta[String(c.id)];
          return m ? { ...c, progress: m.progress, completed: m.completed } : c;
        });

        if (cancelled) return;

        setCourses(coursesWithProgress);
        setCurrentUser((prev) =>
          prev ? { ...prev, enrolledCourseIds: enrolledIds as any } : prev,
        );
      } catch (err) {
        console.error('Failed to load courses/enrollments:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, currentUser?.id]);


  const logAuditEvent = (action: string, details: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: Math.max(...auditLogs.map((l) => l.id), 0) + 1,
      userId: currentUser?.id ?? '',
      userName: currentUser?.name || 'System',
      action,
      details,
      timestamp: new Date().toISOString(),
      type,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const refreshCourses = async () => {
    try {
      const allCourses: any = await Api.courses.list();
      const list = Array.isArray(allCourses)
        ? allCourses
        : allCourses?.data ?? allCourses?.courses ?? [];
      const normalized = list.map(normalizeCourse);
      setCourses(normalized);
      return normalized;
    } catch (err) {
      console.error('Failed to refresh courses:', err);
      return [];
    }
  };

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await Api.auth.signin({ email, password });
      if (!result?.session?.access_token) {
        return { success: false, error: 'No session returned from server' };
      }
      authStorage.setToken(result.session.access_token);
      const profileData = await Api.auth.profile(result.session.access_token);
      const rawRole = (profileData.profile?.role ?? 'STUDENT').toString().toLowerCase();
      const role: User['role'] =
        rawRole === 'admin' || rawRole === 'superadmin' || rawRole === 'instructor' || rawRole === 'student'
          ? ((rawRole === 'superadmin' ? 'admin' : rawRole) as User['role'])
          : 'student';
      const realUser: User = {
        id: profileData.id,
        name: profileData.profile?.full_name ?? profileData.email,
        email: profileData.email,
        avatarUrl: profileData.profile?.avatar_url ?? '',
        role,
        enrolledCourseIds: [],
      };
      setCurrentUser(realUser);
      setIsLoggedIn(true);
      logAuditEvent('Login', `${realUser.name} logged in as ${realUser.role}`, 'auth');
      if (role === 'instructor') setCurrentPage('Instructor Dashboard');
      else if (role === 'admin') setCurrentPage('Admin');
      else setCurrentPage('Dashboard');
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(realUser));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Login failed. Please try again.' };
    }
  };

  const handleLogout = () => {
    if (currentUser) logAuditEvent('Logout', `${currentUser.name} logged out`, 'auth');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('Dashboard');
    setSelectedCourse(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedCourse(null);
    if (completedCourse) setCompletedCourse(null);
  };

  const handleCourseSelect = (course: Course) => setSelectedCourse(course);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSelectedCourse(null);
      setEditingCourse(null);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    if (currentUser && currentUser.id === updatedUser.id) setCurrentUser(updatedUser);
    logAuditEvent('User Updated', `Updated user: ${updatedUser.name} (${updatedUser.role})`, 'user');
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleUserDelete = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) logAuditEvent('User Deleted', `Deleted user: ${target.name}`, 'user');
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUserAdd = (userData: Omit<User, 'id' | 'enrolledCourseIds'>) => {
    const newUser: User = {
      ...userData,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      enrolledCourseIds: [],
    };
    logAuditEvent('User Created', `Created new user: ${newUser.name} as ${newUser.role}`, 'user');
    setUsers((prev) => [...prev, newUser]);
  };

  const handleEnrollmentSuccess = async (courseId: number | string): Promise<void> => {
    if (!currentUser) return;
    const token = authStorage.getToken();
    if (!token) throw new Error('Not signed in');
  
    const idStr = String(courseId);
  
    
    if (currentUser.enrolledCourseIds.some((id) => String(id) === idStr)) return;
  
    await api.post(
      `/courses/enroll?userId=${currentUser.id}`,
      { course_id: idStr },
      token,
    );
  
    const updatedUser: User = {
      ...currentUser,
      enrolledCourseIds: [...currentUser.enrolledCourseIds, idStr as any],
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    logAuditEvent('Enrolled', `Enrolled in course ${idStr}`, 'course');
  };

  const coursesWithEnrollmentStatus: CourseWithEnrollment[] = useMemo(() => {
    if (!currentUser) return courses.map((c) => ({ ...c, isEnrolled: false }));
    const enrolled = new Set(currentUser.enrolledCourseIds.map((id) => String(id)));
    return courses.map((course) => ({
      ...course,
      isEnrolled: enrolled.has(String(course.id)),
    }));
  }, [currentUser, courses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return coursesWithEnrollmentStatus.filter((course) =>
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.category.toLowerCase().includes(q) ||
      course.instructor.toLowerCase().includes(q),
    );
  }, [searchQuery, coursesWithEnrollmentStatus]);

  const handleToggleLessonComplete = (
    courseId: number | string,
    lessonId: number | string,
  ) => {
    let courseToComplete: Course | null = null;
    let toggledToCompleted = false;
  
    const updatedCourses = courses.map((course) => {
      if (String(course.id) === String(courseId)) {
        const updatedContent = course.content.map((module) => {
          const updatedLessons = module.lessons.map((lesson) => {
            if (String(lesson.id) === String(lessonId)) {
              toggledToCompleted = !lesson.isCompleted;
              return { ...lesson, isCompleted: !lesson.isCompleted };
            }
            return lesson;
          });
          const completed = updatedLessons.filter((l) => l.isCompleted).length;
          const progress =
            updatedLessons.length > 0
              ? Math.round((completed / updatedLessons.length) * 100)
              : 0;
          return { ...module, lessons: updatedLessons, progress };
        });
  
        const totalLessons = updatedContent.reduce(
          (acc, m) => acc + m.lessons.length,
          0,
        );
        const totalCompleted = updatedContent.reduce(
          (acc, m) => acc + m.lessons.filter((l) => l.isCompleted).length,
          0,
        );
        const courseProgress =
          totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
        const isCourseComplete = courseProgress === 100;
  
        const updatedCourse = {
          ...course,
          content: updatedContent,
          progress: courseProgress,
          completed: isCourseComplete,
        };
  
        if (isCourseComplete && !course.completed) courseToComplete = updatedCourse;
        if (String(selectedCourse?.id) === String(courseId))
          setSelectedCourse(updatedCourse);
  
        return updatedCourse;
      }
      return course;
    });
  
    setCourses(updatedCourses);
    if (courseToComplete) setCompletedCourse(courseToComplete);
    logAuditEvent(
      'Lesson Toggled',
      `Lesson ${lessonId} toggled for course ${courseId}`,
      'course',
    );
  
  
    handleLessonProgressToggle(lessonId, toggledToCompleted);
  };

  // Real backend call for lesson progress
  const handleLessonProgressToggle = async (lessonId: string | number, isCompleted: boolean): Promise<void> => {
    if (!currentUser) return;
    const token = authStorage.getToken();
    if (!token) return;
    try {
      await api.patch(
        `/courses/progress?userId=${currentUser.id}`,
        { lesson_id: String(lessonId), is_completed: isCompleted },
        token,
      );
    } catch (err) {
      console.error('Lesson progress update failed:', err);
    }
  };

  const handleProjectSubmit = async (
    courseId: number | string,
    projectId: number | string,
    submissionLink: string,
  ) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) === String(courseId)) {
          const updatedProjects = course.projects.map((p) =>
            String(p.id) === String(projectId)
              ? { ...p, isGrading: true, submissionLink }
              : p,
          );
          const updated = { ...course, projects: updatedProjects };
          if (String(selectedCourse?.id) === String(courseId)) setSelectedCourse(updated);
          return updated;
        }
        return course;
      }),
    );
  
    setTimeout(() => {
      setCourses((prev) =>
        prev.map((course) => {
          if (String(course.id) === String(courseId)) {
            const updatedProjects = course.projects.map((p) => {
              if (String(p.id) === String(projectId)) {
                const score = Math.floor(Math.random() * 21) + 80;
                return {
                  ...p,
                  isSubmitted: true,
                  isGrading: false,
                  score,
                  feedback: `Great job! Score: ${score}%`,
                };
              }
              return p;
            });
            const updated = { ...course, projects: updatedProjects };
            if (String(selectedCourse?.id) === String(courseId)) setSelectedCourse(updated);
            return updated;
          }
          return course;
        }),
      );
      logAuditEvent('Project Submitted', `Project ${projectId} submitted for course ${courseId}`, 'course');
    }, 2000);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsBotTyping(true);
    try {
      let responseText = "I'm having trouble connecting right now.";
      if (ai) {
        const result = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: text });
        responseText = result.text || "I couldn't generate a response.";
      } else {
        responseText = "I'm here to help! Could you tell me more?";
      }
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: responseText, sender: 'bot', timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()) },
      ]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, text: 'I hit an error. Try again.', sender: 'bot', timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()) },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSendCourseMessage = async (courseId: number | string, text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) === String(courseId)) {
          const updated = { ...course, chatHistory: [...(course.chatHistory || []), userMsg], isAssistantTyping: true };
          if (String(selectedCourse?.id) === String(courseId)) setSelectedCourse(updated);
          return updated;
        }
        return course;
      }),
    );
    try {
      let responseText = "I'm here to help. What would you like to know?";
      if (ai) {
        const course = courses.find((c) => String(c.id) === String(courseId));
        const prompt = `You are a teaching assistant for "${course?.title}". Student asks: ${text}`;
        const result = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        responseText = result.text || "I couldn't generate a response.";
      }
      setCourses((prev) =>
        prev.map((course) => {
          if (String(course.id) === String(courseId)) {
            const updated = {
              ...course,
              chatHistory: [...(course.chatHistory || []), { id: Date.now() + 1, text: responseText, sender: 'bot' as const, timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()) }],
              isAssistantTyping: false,
            };
            if (String(selectedCourse?.id) === String(courseId)) setSelectedCourse(updated);
            return updated;
          }
          return course;
        }),
      );
    } catch (error) {
      console.error('AI Error:', error);
      setCourses((prev) =>
        prev.map((course) => {
          if (String(course.id) === String(courseId)) {
            return {
              ...course,
              chatHistory: [...(course.chatHistory || []), { id: Date.now() + 2, text: 'Error. Try again.', sender: 'bot' as const, timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()) }],
              isAssistantTyping: false,
            };
          }
          return course;
        }),
      );
    }
  };

  const handleInstructorCourseAdd = async (
    courseData: Omit<Course, 'id' | 'enrollmentCount' | 'rating' | 'progress' | 'completed' | 'reviews' | 'content' | 'projects' | 'webinars'>,
    initialModules?: { title: string }[],
  ): Promise<void> => {
    if (!currentUser) throw new Error('You must be signed in to create a course');
    const token = authStorage.getToken();
    const baseSlug = courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const uniqueSuffix = Math.random().toString(36).slice(2, 8);
const slug = `${baseSlug}-${uniqueSuffix}`;
    try {
      const created: any = await api.post(
        `/courses?instructorId=${currentUser.id}`,
        {
          title: courseData.title,
          slug,
          description: courseData.description,
          short_description: courseData.description.slice(0, 150),
          category: courseData.category,
          price: courseData.price ?? 0,
          image_url: courseData.imageUrl,
          status: 'PUBLISHED',
          is_published: true,
        },
        token,
      );
      const createdCourse = created?.course ?? created;
      const newCourseId = createdCourse?.id;
      if (initialModules?.length && newCourseId) {
        for (let i = 0; i < initialModules.length; i++) {
          try {
            await api.post(
              `/courses/courses/${newCourseId}/modules?instructorId=${currentUser.id}`,
              { title: initialModules[i].title, order_number: i },
              token,
            );
          } catch (e) {
            console.error('Module creation failed:', e);
          }
        }
      }
      await refreshCourses();
      logAuditEvent('Course Created', `Created course: ${courseData.title}`, 'course');
    } catch (err: any) {
      console.error('Course creation failed:', err);
      throw new Error(err?.message ?? 'Failed to create course');
    }
  };

  const handleCourseUpdate = async (courseId: number | string, updatedDetails: Partial<Course>): Promise<void> => {
    const token = authStorage.getToken();
    if (!token || !currentUser) throw new Error('Not signed in');
    const payload: any = {};
    if (updatedDetails.title) payload.title = updatedDetails.title;
    if (updatedDetails.description) payload.description = updatedDetails.description;
    if (updatedDetails.category) payload.category = updatedDetails.category;
    if (updatedDetails.price !== undefined) payload.price = updatedDetails.price;
    if (updatedDetails.imageUrl) payload.image_url = updatedDetails.imageUrl;
    await api.put(`/courses/${String(courseId)}?instructorId=${currentUser.id}`, payload, token);
    setCourses((prev) =>
      prev.map((c) => (String(c.id) === String(courseId) ? { ...c, ...updatedDetails } : c)),
    );
    logAuditEvent('Course Updated', `Updated course ${courseId}`, 'course');
  };

  const handleCourseDelete = async (courseId: number | string): Promise<void> => {
    const token = authStorage.getToken();
    if (!token || !currentUser) throw new Error('Not signed in');
    await api.delete(`/courses/${String(courseId)}?instructorId=${currentUser.id}`, token);
    setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
    if (String(selectedCourse?.id) === String(courseId)) setSelectedCourse(null);
    if (String(editingCourse?.id) === String(courseId)) setEditingCourse(null);
    logAuditEvent('Course Deleted', `Deleted course ${courseId}`, 'course');
  };

  const handleModuleAdd = async (
    courseId: number | string,
    moduleTitle: string,
  ): Promise<{ id: string | number; title: string } | null> => {
    console.log('=== handleModuleAdd START ===');
    const token = authStorage.getToken();
    if (!token || !currentUser) {
      console.error('Not signed in — no token or user');
      throw new Error('Not signed in');
    }
    const course = courses.find((c) => String(c.id) === String(courseId));
    const order_number = course?.content?.length ?? 0;
    const url = `/courses/courses/${String(courseId)}/modules?instructorId=${currentUser.id}`;
    console.log('POST URL:', url);
    console.log('POST body:', { title: moduleTitle, order_number });
  
    let response: any;
    try {
      response = await api.post(url, { title: moduleTitle, order_number }, token);
      console.log('POST response:', response);
    } catch (err) {
      console.error('POST failed:', err);
      throw err;
    }
  
    await refreshCourses();
    logAuditEvent('Module Added', `Added module "${moduleTitle}"`, 'course');
  
    // Return the actual created module so EditCourse can replace the temp ID
    if (response && response.id) {
      return { id: response.id, title: response.title ?? moduleTitle };
    }
    return null;
  };

  const handleLessonAdd = async (
    courseId: number | string,
    moduleId: number | string,
    lessonData: Omit<Lesson, 'id' | 'isCompleted'> & {
      description?: string;
      durationMinutes?: number;
      isFree?: boolean;
    },
  ): Promise<void> => {
    const token = authStorage.getToken();
    if (!token || !currentUser) throw new Error('Not signed in');
    const course = courses.find((c) => String(c.id) === String(courseId));
    const moduleObj = course?.content?.find((m) => String(m.id) === String(moduleId));
    const order_number = moduleObj?.lessons?.length ?? 0;
  
    await api.post(
      `/courses/modules/${String(moduleId)}/lessons?instructorId=${currentUser.id}`,
      {
        title: lessonData.title,
        description: lessonData.description,
        video_url: lessonData.videoUrl,
        video_duration: lessonData.durationMinutes,
        text_content: lessonData.content,
        order_number,
        is_free: lessonData.isFree ?? false,
      },
      token,
    );
  
    await refreshCourses();
    logAuditEvent('Lesson Added', `Added lesson "${lessonData.title}"`, 'course');
  };

  const handleLessonDelete = async (courseId: number | string, lessonId: number | string): Promise<void> => {
    const token = authStorage.getToken();
    if (!token || !currentUser) throw new Error('Not signed in');
    await api.delete(`/courses/lessons/${String(lessonId)}?instructorId=${currentUser.id}`, token);
    await refreshCourses();
    logAuditEvent('Lesson Deleted', `Deleted lesson ${lessonId}`, 'course');
  };

  const handleWebinarAdd = (courseId: number, webinarData: Omit<Webinar, 'id'>) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) === String(courseId)) {
          const newWebinar = { ...webinarData, id: Math.max(...(course.webinars || []).map((w) => w.id), 0) + 1 };
          const updated = { ...course, webinars: [...(course.webinars || []), newWebinar] };
          if (editingCourse?.id === courseId) setEditingCourse(updated);
          return updated;
        }
        return course;
      }),
    );
    logAuditEvent('Webinar Added', `Added webinar "${webinarData.title}"`, 'course');
  };

  const handleWebinarDelete = (courseId: number, webinarId: number) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) === String(courseId)) {
          const updated = { ...course, webinars: (course.webinars || []).filter((w) => w.id !== webinarId) };
          if (editingCourse?.id === courseId) setEditingCourse(updated);
          return updated;
        }
        return course;
      }),
    );
    logAuditEvent('Webinar Deleted', `Deleted webinar ${webinarId}`, 'course');
  };

  const handleWebinarRegister = async (webinarId: string | number): Promise<void> => {
    if (!currentUser) throw new Error('Not signed in');
    const token = authStorage.getToken();
    if (!token) throw new Error('Not signed in');
    await Api.webinars.register(
      { webinar_id: String(webinarId), user_id: currentUser.id },
      token,
    );
    logAuditEvent('Webinar Registered', `Registered for webinar ${webinarId}`, 'user');
  };

  const handleInstructorMessageSend = (studentId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: InstructorMessage = {
      id: Date.now(),
      instructorId: currentUser.id,
      studentId,
      text,
      timestamp: new Date().toISOString(),
    };
    setInstructorMessages((prev) => [...prev, newMessage]);
    logAuditEvent('Message Sent', `Instructor ${currentUser.name} messaged student ${studentId}`, 'user');
  };

  const handlePayoutRequest = (payoutData: Omit<PayoutRequest, 'id' | 'instructorId' | 'status' | 'timestamp'>) => {
    if (!currentUser) return;
    const newRequest: PayoutRequest = {
      ...payoutData,
      id: Date.now(),
      instructorId: currentUser.id,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
    setPayoutRequests((prev) => [...prev, newRequest]);
    logAuditEvent('Payout Requested', `Instructor ${currentUser.name} requested ${payoutData.amount}`, 'system');
  };

  const value: AppContextType = {
    isLoggedIn, currentUser, users, courses, currentPage, selectedCourse, editingCourse, completedCourse,
    isChatOpen, isBotTyping, isHydrated, messages, searchQuery, language,
    coursesWithEnrollmentStatus, filteredCourses, auditLogs, payoutRequests, instructorMessages,
    setIsLoggedIn, setCurrentUser, setCourses, setCurrentPage, setSelectedCourse, setEditingCourse,
    setCompletedCourse, setIsChatOpen, setIsBotTyping, setMessages, setSearchQuery, setLanguage,
    handleLogin, handleLogout, handleNavigate, handleCourseSelect, handleSearchChange,
    handleUserUpdate, handleUserDelete, handleUserAdd,
    handleEnrollmentSuccess, handleToggleLessonComplete, handleLessonProgressToggle, handleProjectSubmit,
    handleSendMessage, handleSendCourseMessage, logAuditEvent,
    handleInstructorCourseAdd, handleInstructorMessageSend, handlePayoutRequest,
    handleCourseUpdate, handleCourseDelete, handleModuleAdd, handleLessonAdd, handleLessonDelete,
    handleWebinarAdd, handleWebinarDelete, handleWebinarRegister,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}