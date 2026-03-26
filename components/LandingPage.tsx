"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { CourseCard } from "./CourseCard";
import type { Course, CourseWithEnrollment } from "../types";

interface LandingPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
  courses: Course[];
}

const FeatureCard: React.FC<{
  iconName: string;
  title: string;
  children: React.ReactNode;
}> = ({ iconName, title, children }) => (
  <div className="bg-white p-6 rounded-xl text-center border border-gray-200 shadow-lg">
    <div className="flex justify-center mb-4">
      <div className="p-3 bg-gradient-to-br from-brand-primary to-[#219BD5] rounded-full shadow-md">
        <Icon name={iconName} className="w-8 h-8 text-white" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
  courses,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Web Development");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sample category-specific courses matching the Course type
  const getCoursesByCategory = (category: string): Course[] => {
    const categoryCourses: Record<string, Course[]> = {
      "Python": [
        { 
          id: 1001, 
          title: "Complete Python Bootcamp", 
          category: "Python",
          instructor: "Jose Portilla", 
          duration: "32 hours",
          description: "Learn Python from scratch and build real-world applications",
          price: 84.99, 
          rating: 4.6,
          enrollmentCount: 125000,
          imageUrl: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 25,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 1002, 
          title: "Python for Data Science", 
          category: "Python",
          instructor: "Dr. Angela Yu", 
          duration: "28 hours",
          description: "Master data analysis and visualization with Python",
          price: 89.99, 
          rating: 4.8,
          enrollmentCount: 89000,
          imageUrl: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 20,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 1003, 
          title: "Automate with Python", 
          category: "Python",
          instructor: "Al Sweigart", 
          duration: "24 hours",
          description: "Automate repetitive tasks and boost productivity",
          price: 74.99, 
          rating: 4.7,
          enrollmentCount: 67000,
          imageUrl: "https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 18,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 1004, 
          title: "Python Django Framework", 
          category: "Python",
          instructor: "Maximilian Schwarzmüller", 
          duration: "36 hours",
          description: "Build robust web applications with Django",
          price: 94.99, 
          rating: 4.9,
          enrollmentCount: 45000,
          imageUrl: "https://images.pexels.com/photos/11035539/pexels-photo-11035539.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 30,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 1005, 
          title: "Machine Learning with Python", 
          category: "Python",
          instructor: "Andrew Ng", 
          duration: "40 hours",
          description: "Master machine learning algorithms and techniques",
          price: 99.99, 
          rating: 4.9,
          enrollmentCount: 112000,
          imageUrl: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 35,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
      ],
      "Excel": [
        { 
          id: 2001, 
          title: "Excel Skills for Business", 
          category: "Excel",
          instructor: "Macquarie University", 
          duration: "28 hours",
          description: "Master Excel for business analytics",
          price: 79.99, 
          rating: 4.7,
          enrollmentCount: 156000,
          imageUrl: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 22,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 2002, 
          title: "Advanced Excel Formulas", 
          category: "Excel",
          instructor: "Chris Dutton", 
          duration: "20 hours",
          description: "Master complex Excel formulas and functions",
          price: 69.99, 
          rating: 4.8,
          enrollmentCount: 78000,
          imageUrl: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 16,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 2003, 
          title: "Excel Data Analysis", 
          category: "Excel",
          instructor: "Pavan Lalwani", 
          duration: "24 hours",
          description: "Analyze and visualize data like a pro",
          price: 84.99, 
          rating: 4.6,
          enrollmentCount: 92000,
          imageUrl: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 19,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 2004, 
          title: "Excel VBA Programming", 
          category: "Excel",
          instructor: "Kyle Pew", 
          duration: "30 hours",
          description: "Automate Excel tasks with VBA macros",
          price: 94.99, 
          rating: 4.7,
          enrollmentCount: 54000,
          imageUrl: "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 24,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 2005, 
          title: "Excel Dashboard Design", 
          category: "Excel",
          instructor: "Mynda Treacy", 
          duration: "22 hours",
          description: "Create stunning interactive dashboards",
          price: 89.99, 
          rating: 4.8,
          enrollmentCount: 43000,
          imageUrl: "https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 18,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
      ],
      "Web Development": [
        { 
          id: 3001, 
          title: "The Complete Web Developer Course", 
          category: "Web Development",
          instructor: "Dr. Angela Yu", 
          duration: "55 hours",
          description: "Become a full-stack web developer",
          price: 94.99, 
          rating: 4.8,
          enrollmentCount: 245000,
          imageUrl: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 45,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 3002, 
          title: "Modern React with Redux", 
          category: "Web Development",
          instructor: "Stephen Grider", 
          duration: "48 hours",
          description: "Master React and Redux for modern web apps",
          price: 89.99, 
          rating: 4.7,
          enrollmentCount: 134000,
          imageUrl: "https://images.pexels.com/photos/11035539/pexels-photo-11035539.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 40,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 3003, 
          title: "Node.js Advanced Concepts", 
          category: "Web Development",
          instructor: "Maximilian Schwarzmüller", 
          duration: "35 hours",
          description: "Build scalable backend applications",
          price: 84.99, 
          rating: 4.9,
          enrollmentCount: 89000,
          imageUrl: "https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 28,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 3004, 
          title: "CSS Grid & Flexbox Mastery", 
          category: "Web Development",
          instructor: "Colt Steele", 
          duration: "20 hours",
          description: "Create responsive layouts with modern CSS",
          price: 69.99, 
          rating: 4.8,
          enrollmentCount: 112000,
          imageUrl: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 16,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 3005, 
          title: "TypeScript for Professionals", 
          category: "Web Development",
          instructor: "Brad Traversy", 
          duration: "25 hours",
          description: "Master TypeScript for large-scale applications",
          price: 79.99, 
          rating: 4.7,
          enrollmentCount: 67000,
          imageUrl: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 20,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
      ],
      "JavaScript": [
        { 
          id: 4001, 
          title: "JavaScript: The Advanced Concepts", 
          category: "JavaScript",
          instructor: "Andrei Neagoie", 
          duration: "42 hours",
          description: "Master modern JavaScript from fundamentals to advanced concepts",
          price: 89.99, 
          rating: 4.8,
          enrollmentCount: 156000,
          imageUrl: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 35,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 4002, 
          title: "ES6 JavaScript Mastery", 
          category: "JavaScript",
          instructor: "Jonas Schmedtmann", 
          duration: "30 hours",
          description: "Learn modern ES6+ features and best practices",
          price: 79.99, 
          rating: 4.9,
          enrollmentCount: 98000,
          imageUrl: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 25,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 4003, 
          title: "Async JavaScript", 
          category: "JavaScript",
          instructor: "Stephen Grider", 
          duration: "18 hours",
          description: "Master promises, async/await, and asynchronous patterns",
          price: 74.99, 
          rating: 4.7,
          enrollmentCount: 67000,
          imageUrl: "https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 15,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 4004, 
          title: "JavaScript Design Patterns", 
          category: "JavaScript",
          instructor: "Maximilian Schwarzmüller", 
          duration: "28 hours",
          description: "Learn professional design patterns in JavaScript",
          price: 84.99, 
          rating: 4.8,
          enrollmentCount: 45000,
          imageUrl: "https://images.pexels.com/photos/11035539/pexels-photo-11035539.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 22,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 4005, 
          title: "React with JavaScript", 
          category: "JavaScript",
          instructor: "Dr. Angela Yu", 
          duration: "45 hours",
          description: "Build modern React applications with pure JavaScript",
          price: 94.99, 
          rating: 4.9,
          enrollmentCount: 123000,
          imageUrl: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 38,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
      ],
      "Data Science": [
        { 
          id: 5001, 
          title: "Data Science Bootcamp", 
          category: "Data Science",
          instructor: "Jose Portilla", 
          duration: "50 hours",
          description: "Complete data science curriculum with Python",
          price: 99.99, 
          rating: 4.7,
          enrollmentCount: 187000,
          imageUrl: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 45,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 5002, 
          title: "Machine Learning A-Z", 
          category: "Data Science",
          instructor: "Kirill Eremenko", 
          duration: "45 hours",
          description: "Learn machine learning algorithms from A to Z",
          price: 94.99, 
          rating: 4.8,
          enrollmentCount: 234000,
          imageUrl: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 40,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 5003, 
          title: "Python for Data Science", 
          category: "Data Science",
          instructor: "Dr. Angela Yu", 
          duration: "35 hours",
          description: "Master Python for data analysis and visualization",
          price: 89.99, 
          rating: 4.8,
          enrollmentCount: 156000,
          imageUrl: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 30,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 5004, 
          title: "Deep Learning Specialization", 
          category: "Data Science",
          instructor: "Andrew Ng", 
          duration: "60 hours",
          description: "Master deep learning and neural networks",
          price: 79.99, 
          rating: 4.9,
          enrollmentCount: 178000,
          imageUrl: "https://images.pexels.com/photos/11035539/pexels-photo-11035539.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 50,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 5005, 
          title: "SQL for Data Analysis", 
          category: "Data Science",
          instructor: "Maven Analytics", 
          duration: "25 hours",
          description: "Master SQL for data extraction and analysis",
          price: 69.99, 
          rating: 4.7,
          enrollmentCount: 89000,
          imageUrl: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 20,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
      ],
      "Amazon AWS": [
        { 
          id: 6001, 
          title: "AWS Certified Solutions Architect", 
          category: "Amazon AWS",
          instructor: "Stephane Maarek", 
          duration: "65 hours",
          description: "Prepare for AWS Solutions Architect certification",
          price: 119.99, 
          rating: 4.9,
          enrollmentCount: 234000,
          imageUrl: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 55,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 6002, 
          title: "AWS Developer Associate", 
          category: "Amazon AWS",
          instructor: "Ryan Kroonenburg", 
          duration: "45 hours",
          description: "Become an AWS certified developer",
          price: 109.99, 
          rating: 4.8,
          enrollmentCount: 89000,
          imageUrl: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 40,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 6003, 
          title: "AWS Lambda & Serverless", 
          category: "Amazon AWS",
          instructor: "Jeremy Cook", 
          duration: "28 hours",
          description: "Build serverless applications with AWS Lambda",
          price: 94.99, 
          rating: 4.7,
          enrollmentCount: 67000,
          imageUrl: "https://images.pexels.com/photos/11035539/pexels-photo-11035539.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 24,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 6004, 
          title: "DevOps on AWS", 
          category: "Amazon AWS",
          instructor: "Derek Morgan", 
          duration: "35 hours",
          description: "Master DevOps practices on AWS platform",
          price: 99.99, 
          rating: 4.8,
          enrollmentCount: 54000,
          imageUrl: "https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 30,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 6005, 
          title: "AWS Security Best Practices", 
          category: "Amazon AWS",
          instructor: "Zeal Vora", 
          duration: "32 hours",
          description: "Secure your AWS infrastructure",
          price: 104.99, 
          rating: 4.9,
          enrollmentCount: 45000,
          imageUrl: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 28,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
      ],
      "Drawing": [
        { 
          id: 7001, 
          title: "Complete Drawing Masterclass", 
          category: "Drawing",
          instructor: "Jaysen Batchelor", 
          duration: "40 hours",
          description: "Learn drawing fundamentals from scratch",
          price: 84.99, 
          rating: 4.7,
          enrollmentCount: 123000,
          imageUrl: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 35,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 7002, 
          title: "Character Design for Beginners", 
          category: "Drawing",
          instructor: "Scott Harris", 
          duration: "28 hours",
          description: "Create memorable character designs",
          price: 79.99, 
          rating: 4.8,
          enrollmentCount: 67000,
          imageUrl: "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 24,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 7003, 
          title: "Digital Drawing in Procreate", 
          category: "Drawing",
          instructor: "Brad Colbow", 
          duration: "32 hours",
          description: "Master digital art on iPad with Procreate",
          price: 89.99, 
          rating: 4.9,
          enrollmentCount: 89000,
          imageUrl: "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 28,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 7004, 
          title: "Anatomy for Artists", 
          category: "Drawing",
          instructor: "Rey Bustos", 
          duration: "36 hours",
          description: "Master human anatomy for figure drawing",
          price: 94.99, 
          rating: 4.8,
          enrollmentCount: 54000,
          imageUrl: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 32,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
        { 
          id: 7005, 
          title: "Watercolor Painting", 
          category: "Drawing",
          instructor: "Ana Victoria Calderon", 
          duration: "25 hours",
          description: "Learn watercolor techniques from basics to advanced",
          price: 74.99, 
          rating: 4.7,
          enrollmentCount: 78000,
          imageUrl: "https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
          modules: 22,
          content: [],
          projects: [],
          progress: 0,
          completed: false,
          reviews: []
        },
      ],
    };

    return categoryCourses[category] || [];
  };

  // Get all courses from all categories for search
  const getAllCourses = (): Course[] => {
    const allCategories = ['Python', 'Excel', 'Web Development', 'JavaScript', 'Data Science', 'Amazon AWS', 'Drawing'];
    const allCourses: Course[] = [];
    allCategories.forEach(cat => {
      allCourses.push(...getCoursesByCategory(cat));
    });
    return allCourses;
  };

  // Search function
  const handleSearch = (query: string, shouldScroll: boolean = false) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setIsSearching(false);
      setSearchResults([]);
    } else {
      const allCourses = getAllCourses();
      const results = allCourses.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(true);
      
      if (shouldScroll) {
        const coursesSection = document.getElementById('courses');
        if (coursesSection) {
          coursesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
  };

  const categories = ['Python', 'Excel', 'Web Development', 'JavaScript', 'Data Science', 'Amazon AWS', 'Drawing'];
  const currentCourses = getCoursesByCategory(activeCategory);

  // Map courses to CourseWithEnrollment for the CourseCard component
  const coursesWithEnrollment: CourseWithEnrollment[] = (isSearching ? searchResults : currentCourses).map(course => ({
    ...course,
    isEnrolled: false
  }));

  return (
    <div className="text-gray-800 font-sans bg-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center gap-4 lg:gap-8">
          <Logo size="md" />
          
          <button 
            onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden lg:block text-sm text-gray-600 hover:text-[#219BD5] font-medium"
          >
            Courses
          </button>

          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-4 h-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search for anything" 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery, true)}
              className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-[#219BD5] rounded-full py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="hidden xl:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-[#219BD5]">Cortouch Business</a>
            <a href="#" className="hover:text-[#219BD5]">Teach on Cortouch</a>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            
          
            <button
              onClick={onNavigateToSignIn}
              className="px-4 py-2 text-sm font-bold text-[#219BD5] border border-[#219BD5] hover:bg-[#219BD5]/10 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onNavigateToSignUp}
              className="px-4 py-2 bg-[#219BD5] text-white text-sm font-bold hover:bg-[#1a7fb0] transition-all"
            >
              Sign up
            </button>
            <button className="p-2 border border-gray-300 hover:bg-gray-100 transition-colors">
              <Icon name="globe" className="w-5 h-5 text-gray-600" />
            </button>
            
          </div>
        </div>
      </header>

      <main className="pt-[65px]">
        {/* Hero Section - White Card Background */}
        <section className="relative h-[500px] lg:h-[550px] overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="Professional in modern office workspace" 
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <div className="bg-white p-8 lg:p-10 rounded-lg shadow-2xl max-w-xl">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-5 leading-tight">
                Learning that gets you
              </h1>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                Skills for your present (and your future). Get started with us today.
              </p>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="What do you want to learn?" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery, true)}
                  className="w-full border border-gray-300 focus:border-[#219BD5] py-3.5 px-4 text-base outline-none focus:ring-1 focus:ring-[#219BD5] rounded-lg"
                />
                <button 
                  onClick={() => handleSearch(searchQuery, true)}
                  className="absolute right-0 top-0 bottom-0 px-6 bg-[#219BD5] text-white hover:bg-[#1a7fb0] transition-colors font-semibold rounded-r-lg"
                >
                  <Icon name="search" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-600 mb-8 text-lg">Trusted by over 15,000 companies and millions of learners worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
              {['Volkswagen', 'Samsung', 'Cisco', 'AT&T', 'Procter & Gamble', 'Hewlett Packard'].map(partner => (
                <div key={partner} className="text-xl lg:text-2xl font-bold text-gray-400 font-serif">{partner}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Broad Selection Section with Interactive Tabs */}
        <section id="courses" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900">
                {isSearching ? `Search Results for "${searchQuery}"` : "A broad selection of courses"}
              </h2>
              {isSearching && (
                <button
                  onClick={clearSearch}
                  className="text-[#219BD5] hover:text-[#1a7fb0] font-semibold text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
            <p className="text-lg text-gray-600 mb-8">
              {isSearching 
                ? `Found ${searchResults.length} course${searchResults.length !== 1 ? 's' : ''} matching your search`
                : "Choose from over 210,000 online video courses with new additions published every month"}
            </p>
            
            {/* Category Tabs - Hide when searching */}
            {!isSearching && (
              <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-sm font-bold pb-3 whitespace-nowrap transition-colors ${
                      activeCategory === cat 
                        ? 'text-[#219BD5] border-b-2 border-[#219BD5]' 
                        : 'text-gray-500 hover:text-[#219BD5]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="border border-gray-200 p-8 rounded-sm">
              {/* Dynamic content based on search or category */}
              {!isSearching && (
                <div className="max-w-3xl mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {activeCategory === "Web Development" 
                      ? "Build websites with HTML, CSS, JavaScript, and more"
                      : activeCategory === "Python"
                      ? "Master Python programming for data science, automation, and web development"
                      : activeCategory === "Excel"
                      ? "Excel skills for business, data analysis, and financial modeling"
                      : activeCategory === "JavaScript"
                      ? "Learn modern JavaScript from fundamentals to advanced concepts"
                      : activeCategory === "Data Science"
                      ? "Data science, machine learning, and AI fundamentals"
                      : activeCategory === "Amazon AWS"
                      ? "AWS cloud computing, solutions architecture, and DevOps"
                      : "Drawing fundamentals, digital art, and creative illustration"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeCategory === "Web Development" 
                      ? "The world of web development is as wide as the internet itself. Much of our social and economic lives play out on the internet, which of course, is a whole lot of websites."
                      : activeCategory === "Python"
                      ? "Python is one of the most versatile programming languages, used for web development, data science, automation, and artificial intelligence."
                      : activeCategory === "Excel"
                      ? "Excel is the world's most powerful spreadsheet software. Master it for business analytics, financial modeling, and data visualization."
                      : activeCategory === "JavaScript"
                      ? "JavaScript powers the modern web. Learn it to build interactive websites, web apps, and full-stack applications."
                      : activeCategory === "Data Science"
                      ? "Data science combines statistics, programming, and domain expertise to extract insights from data. Master the tools of the trade."
                      : activeCategory === "Amazon AWS"
                      ? "Amazon Web Services is the leading cloud platform. Learn to build, deploy, and scale applications in the cloud."
                      : "Drawing is a fundamental skill for artists and designers. Learn techniques from basic sketching to advanced digital illustration."}
                  </p>
                  <button 
                    onClick={() => setActiveCategory(activeCategory)}
                    className="px-4 py-2 border border-[#219BD5] text-[#219BD5] font-bold text-sm hover:bg-[#219BD5] hover:text-white transition-colors"
                  >
                    Explore {activeCategory}
                  </button>
                </div>
              )}

              {/* Search Results Summary */}
              {isSearching && searchResults.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Showing results for: <span className="font-semibold text-gray-700">"{searchQuery}"</span></p>
                </div>
              )}

              {/* Dynamic Course Grid */}
              {coursesWithEnrollment.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {coursesWithEnrollment.map(course => (
                    <CourseCard 
                      key={course.id} 
                      course={course} 
                      onCourseSelect={() => onNavigateToSignIn()} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any courses matching "{searchQuery}"
                  </p>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-[#219BD5] text-white rounded-lg hover:bg-[#1a7fb0] transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Top categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Design', img: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: 'Development', img: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: 'Marketing', img: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: 'IT and Software', img: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: 'Personal Development', img: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: 'Business', img: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: 'Photography', img: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: 'Music', img: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
              ].map(cat => (
                <div key={cat.name} className="group cursor-pointer">
                  <div className="aspect-square overflow-hidden mb-2">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-[#219BD5]">{cat.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#219BD5] rounded-full flex items-center justify-center mb-4">
                  <Icon name="play" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">210,000 online courses</h3>
                <p className="text-sm text-gray-600">Enjoy a variety of fresh topics</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#219BD5] rounded-full flex items-center justify-center mb-4">
                  <Icon name="star" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Expert instruction</h3>
                <p className="text-sm text-gray-600">Find the right instructor for you</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#219BD5] rounded-full flex items-center justify-center mb-4">
                  <Icon name="shield" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Lifetime access</h3>
                <p className="text-sm text-gray-600">Learn on your schedule</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Instructor Theme */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <img src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop" alt="Instructor teaching" className="w-full rounded-sm shadow-lg" referrerPolicy="no-referrer" />
              </div>
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Become an instructor</h2>
                <p className="text-lg text-gray-600 mb-8">Instructors from around the world teach millions of students on Cortouch. We provide the tools and skills to teach what you love.</p>
                <button
                  onClick={onNavigateToSignUp}
                  className="px-8 py-3 bg-[#219BD5] text-white font-bold hover:bg-[#1a7fb0] transition-all"
                >
                  Start teaching today
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="about" className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Logo size="lg" />
              </div>
              <p className="text-gray-500 max-w-sm mb-8">
                Empowering the next generation of digital creators through world-class education and practical training.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="Facebook">
                  <Icon name="facebook" className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="Instagram">
                  <Icon name="instagram" className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="X (Twitter)">
                  <Icon name="xLogo" className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="TikTok">
                  <Icon name="tiktok" className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-[#219BD5] transition-colors" aria-label="LinkedIn">
                  <Icon name="linkedin" className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Quick Links</h4>
              <ul className="space-y-4 text-gray-500">
                <li><a href="#" className="hover:text-[#219BD5] transition-colors">Home</a></li>
                <li><a href="#courses" className="hover:text-[#219BD5] transition-colors">Courses</a></li>
                <li><a href="#features" className="hover:text-[#219BD5] transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-[#219BD5] transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Contact</h4>
              <ul className="space-y-4 text-gray-500">
                <li>info@cortouchmedia.com.ng</li>
                <li>+2348067473244</li>
                <li>6th Floor Lister Building<br />Ring Road Ibadan, Oyo State.</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <Logo size="sm" />
              <p>&copy; {new Date().getFullYear()} Cortouch Media, Inc.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="#" className="hover:text-[#219BD5] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#219BD5] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#219BD5] transition-colors">Cookie Settings</a>
              <a href="#" className="hover:text-[#219BD5] transition-colors">Sitemap</a>
              <a href="#" className="hover:text-[#219BD5] transition-colors">Accessibility statement</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};