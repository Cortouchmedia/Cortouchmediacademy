import React from 'react';
import type { User, Course, Achievement } from './types';
import { Icon } from './components/Icon';

export const mockUsers: User[] = [
    {
        id: 1,
        name: 'Alex Morgan',
        email: 'alex.morgan@cortouch.io',
        avatarUrl: 'https://picsum.photos/seed/user-avatar/100/100',
        role: 'admin',
        enrolledCourseIds: [1, 2, 4],
    },
    {
        id: 2,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        avatarUrl: 'https://picsum.photos/seed/user2/100/100',
        role: 'student',
        enrolledCourseIds: [3],
    }
];

export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'UI/UX Design Masterclass',
    category: 'Design',
    instructor: 'David Miller',
    duration: '6 Weeks',
    description: 'A comprehensive course covering the fundamentals of UI/UX design, from user research to high-fidelity prototyping. Learn to create intuitive and beautiful digital products.',
    imageUrl: 'https://picsum.photos/seed/course1/600/400',
    price: 45000,
    rating: 4.8,
    enrollmentCount: 1250,
    modules: 5,
    progress: 60,
    completed: false,
    content: [
      { id: 101, title: 'Introduction to UX', progress: 100, lessons: [
        { id: 1011, title: 'What is UX Design?', duration: '10 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: true },
        { id: 1012, title: 'The UX Design Process', duration: '15 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: true },
      ]},
      { id: 102, title: 'User Research & Personas', progress: 50, lessons: [
        { id: 1021, title: 'Conducting User Interviews', duration: '25 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: true },
        { id: 1022, title: 'Creating User Personas', duration: '20 min', type: 'text', content: 'User personas are fictional characters, which you create based upon your research in order to represent the different user types that might use your service, product, site, or brand in a similar way.', isCompleted: false },
      ]},
      { id: 103, title: 'Wireframing & Prototyping', progress: 0, lessons: [
        { id: 1031, title: 'Low-Fidelity Wireframing', duration: '30 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
        { id: 1032, title: 'Interactive Prototyping in Figma', duration: '45 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
      ]},
    ],
    projects: [
      { id: 1, title: 'Create a User Persona', description: 'Based on sample interview data, create a detailed user persona for a new mobile app.', isSubmitted: false },
      { id: 2, title: 'Design a Mobile App Prototype', description: 'Design a high-fidelity, interactive prototype for a fictional coffee ordering app.', isSubmitted: false }
    ],
    reviews: [
        { id: 1, author: 'Jane Doe', avatarUrl: 'https://picsum.photos/seed/user2/40/40', rating: 5, comment: 'Excellent course! The instructor is very clear and the projects are very practical.' }
    ],
    webinars: [
        { id: 1, title: 'Live Q&A with David Miller', date: 'June 25, 2024 @ 2:00 PM', status: 'live', joinUrl: '#' },
        { id: 2, title: 'Advanced Prototyping Workshop', date: 'July 2, 2024 @ 11:00 AM', status: 'upcoming' },
        { id: 3, title: 'AMA: Career in UX Design', date: 'June 18, 2024 @ 3:00 PM', status: 'ended' },
    ],
    chatHistory: [
        { id: 1, text: "Hello! I'm your AI assistant for this course. How can I help you learn UI/UX design?", sender: 'bot', timestamp: '10:00 AM' }
    ]
  },
  {
    id: 2,
    title: 'Advanced Python for Data Science',
    category: 'Programming',
    instructor: 'Emily Carter',
    duration: '8 Weeks',
    description: 'Dive deep into Python libraries like Pandas, NumPy, and Scikit-learn. Work on real-world datasets and build predictive models.',
    imageUrl: 'https://picsum.photos/seed/course2/600/400',
    price: 60000,
    rating: 4.9,
    enrollmentCount: 980,
    modules: 6,
    progress: 25,
    completed: false,
    content: [],
    projects: [],
    reviews: [],
    prerequisiteCourseIds: [4],
    chatHistory: [
        { id: 1, text: "Welcome to Advanced Python! Ask me anything about Pandas, NumPy, or machine learning concepts.", sender: 'bot', timestamp: '11:00 AM' }
    ]
  },
  {
    id: 3,
    title: 'Social Media Marketing Strategy',
    category: 'Marketing',
    instructor: 'Michael Chen',
    duration: '4 Weeks',
    description: 'Learn to create and implement effective social media strategies across various platforms to grow brands and engage audiences.',
    imageUrl: 'https://picsum.photos/seed/course3/600/400',
    price: 35000,
    rating: 4.7,
    enrollmentCount: 2100,
    modules: 4,
    progress: 90,
    completed: false,
    content: [],
    projects: [],
    reviews: [],
    chatHistory: [
        { id: 1, text: "Hi there! I'm your AI assistant for Social Media Marketing. Let's create some amazing campaigns together!", sender: 'bot', timestamp: '12:00 PM' }
    ]
  },
  {
    id: 4,
    title: 'Introduction to Web Development',
    category: 'Programming',
    instructor: 'Sarah Jenkins',
    duration: '10 Weeks',
    description: 'The complete beginner\'s guide to web development. Learn HTML, CSS, and JavaScript from scratch and build your first websites.',
    imageUrl: 'https://picsum.photos/seed/course4/600/400',
    price: 55000,
    rating: 4.8,
    enrollmentCount: 3200,
    modules: 8,
    progress: 100,
    completed: true,
    content: [],
    projects: [
      { id: 1, title: 'Build a Personal Portfolio Website', description: 'Create a responsive portfolio website using HTML, CSS, and JavaScript.', isSubmitted: true, score: 92, feedback: 'Great job, Alex! Your portfolio is visually appealing and fully responsive. Consider adding a contact form with validation for the next iteration.' }
    ],
    reviews: [],
    chatHistory: [
        { id: 1, text: "Hello! Ready to learn Web Development? I'm here to help you with HTML, CSS, and JavaScript questions.", sender: 'bot', timestamp: '01:00 PM' }
    ]
  }
];

export const mockAchievements: Achievement[] = [
    {
        id: 1,
        title: 'Course Completist',
        description: 'Finish your first course',
        icon: <Icon name="award" className="w-6 h-6 text-yellow-500" />
    },
    {
        id: 2,
        title: 'Quick Learner',
        description: 'Complete a course in 7 days',
        icon: <Icon name="trendingUp" className="w-6 h-6 text-green-500" />
    },
    {
        id: 3,
        title: 'Community Helper',
        description: 'Post 10 helpful messages',
        icon: <Icon name="community" className="w-6 h-6 text-[#219BD5]" />
    },
    {
        id: 4,
        title: 'Perfect Score',
        description: 'Get 100% on a project',
        icon: <Icon name="star" className="w-6 h-6 text-purple-500" />
    }
];