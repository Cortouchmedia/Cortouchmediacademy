import React from 'react';

export type Page = 'Dashboard' | 'My Courses' | 'Catalog' | 'Certificates' | 'Community' | 'Settings' | 'About Us' | 'Admin' | 'Admin Portal' | 'Switch to Admin' | 'Instructor Dashboard' | 'Instructor Courses' | 'Instructor Revenue' | 'Instructor Students' | 'Profile' | 'Audit Log';

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'admin' | 'instructor';
  enrolledCourseIds: number[];
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  isSubmitted: boolean;
  score?: number;
  feedback?: string;
  isGrading?: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  duration: string;
  type: 'video' | 'text';
  videoUrl?: string;
  content?: string;
  isCompleted: boolean;
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
  progress: number;
}

export interface Review {
    id: number;
    author: string;
    avatarUrl: string;
    rating: number;
    comment: string;
}

export interface Webinar {
    id: number;
    title: string;
    date: string;
    status: 'live' | 'upcoming' | 'ended';
    joinUrl?: string;
}

export interface Course {
  id: number;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  description: string;
  imageUrl: string;
  price: number;
  rating: number;
  enrollmentCount: number;
  modules: number;
  content: Module[];
  projects: Project[];
  progress: number;
  completed: boolean;
  reviews: Review[];
  chatHistory?: ChatMessage[];
  isAssistantTyping?: boolean;
  webinars?: Webinar[];
  prerequisiteCourseIds?: number[];
  whatYouWillLearn?: string[];
  requirements?: string[];
  instructorBio?: string;
  features?: string[];
}

export interface CourseWithEnrollment extends Course {
    isEnrolled: boolean;
}

export interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export interface CommunityMessage {
    id: number;
    text: string;
    author: string;
    avatarUrl: string;
    timestamp: string;
    isCurrentUser: boolean;
}

export interface CommunityTopic {
    id: number;
    title: string;
    messages: CommunityMessage[];
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'user' | 'course' | 'system' | 'auth';
}

export interface PayoutRequest {
    id: number;
    instructorId: number;
    amount: number;
    accountName: string;
    accountNumber: string;
    bankName: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string;
}

export interface InstructorMessage {
    id: number;
    instructorId: number;
    studentId: number;
    text: string;
    timestamp: string;
}

// FIX: Add this to handle PaystackPop on window, resolving the error in PaystackButton.tsx.
declare global {
    interface Window {
        PaystackPop?: any;
    }
}