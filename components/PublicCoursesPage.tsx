"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { CourseCard } from "./CourseCard";
import { CourseDetails } from "./CourseDetails";
import { PublicHeader } from "./PublicHeader";
import { Footer } from "./Footer";
import { useAppContext } from "../context/AppContext";
import { translations } from "../constants/translations";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Course, CourseWithEnrollment, User, Module, Lesson, Project } from "../types";
import Link from "next/link";

interface PublicCoursesPageProps {
  onNavigateToSignIn: () => void;
  onNavigateToSignUp: () => void;
  onEnrollmentSuccess: (courseId: number) => void;
  user: User | null;
  allCourses: CourseWithEnrollment[];
  onProjectSubmit?: (courseId: number, projectId: number, submissionLink: string) => void;
  onToggleLessonComplete?: (courseId: number, lessonId: number) => void;
  onSendCourseMessage?: (courseId: number, text: string) => void;
}

// Real course images mapping by category
const courseImages: Record<string, string[]> = {
  "Web Development": [
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop"
  ],
  "Python": [
    "https://images.unsplash.com/photo-1526379095098-d4fd4345c60a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1534665482403-a909d0d97c67?w=400&h=300&fit=crop"
  ],
  "JavaScript": [
    "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1623479322729-28b25c16b011?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop"
  ],
  "Excel": [
    "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=400&h=300&fit=crop",
    "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?w=400&h=300&fit=crop",
    "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=400&h=300&fit=crop",
    "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?w=400&h=300&fit=crop"
  ],
  "React": [
    "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop"
  ],
  "Data Science": [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
  ],
  "Amazon AWS": [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop"
  ],
  "Drawing": [
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=400&h=300&fit=crop"
  ]
};

const defaultImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop";

// Generate demo courses - ALWAYS returns courses
const generateDemoCourses = (): CourseWithEnrollment[] => {
  const categories = [
    "Web Development",
    "Python",
    "Excel",
    "JavaScript",
    "Data Science",
    "Amazon AWS",
    "Drawing"
  ];

  const instructors = [
    "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson",
    "Lisa Anderson", "Robert Taylor", "Maria Garcia", "James Martinez", "Patricia Lee"
  ];

  const titles: Record<string, string[]> = {
    "Web Development": [
      "Complete Web Development Bootcamp",
      "Advanced Frontend Development",
      "Backend Mastery with Node.js",
      "Full Stack React & Django",
      "Modern Web Design with Tailwind"
    ],
    "Python": [
      "Python for Beginners",
      "Advanced Python Programming",
      "Python Data Structures & Algorithms",
      "Python Automation & Scripting",
      "Python Web Development with Django"
    ],
    "JavaScript": [
      "JavaScript: The Complete Guide",
      "Modern ES6+ JavaScript",
      "Advanced JavaScript Concepts",
      "Asynchronous JavaScript Mastery",
      "JavaScript Design Patterns"
    ],
    "Excel": [
      "Excel Skills for Business",
      "Advanced Excel Formulas",
      "Excel Data Analysis",
      "Excel VBA Programming",
      "Excel Dashboard Design"
    ]
  };

  let generatedCourses: CourseWithEnrollment[] = [];
  let id = 1;
  
  categories.forEach(category => {
    const categoryTitles = titles[category] || [
      `Advanced ${category}`,
      `${category} Masterclass`,
      `${category} for Professionals`,
      `${category} Bootcamp`,
      `Complete ${category} Guide`
    ];
    
    categoryTitles.forEach((title, index) => {
      const categoryImages = courseImages[category] || [defaultImage];
      const imageUrl = categoryImages[index % categoryImages.length];
      
      const sampleModules: Module[] = [
        {
          id: 1,
          title: "Introduction",
          lessons: [
            { id: 1, title: "Welcome to the Course", duration: "5 min", type: "video" as const, videoUrl: "", content: "", isCompleted: false },
            { id: 2, title: "What You'll Learn", duration: "10 min", type: "video" as const, videoUrl: "", content: "", isCompleted: false },
            { id: 3, title: "Course Resources", duration: "3 min", type: "text" as const, videoUrl: "", content: "", isCompleted: false }
          ],
          progress: 0
        },
        {
          id: 2,
          title: "Core Concepts",
          lessons: [
            { id: 4, title: "Fundamentals", duration: "20 min", type: "video" as const, videoUrl: "", content: "", isCompleted: false },
            { id: 5, title: "Hands-on Exercise", duration: "15 min", type: "text" as const, videoUrl: "", content: "", isCompleted: false },
            { id: 6, title: "Quiz: Core Concepts", duration: "10 min", type: "text" as const, videoUrl: "", content: "", isCompleted: false }
          ],
          progress: 0
        },
        {
          id: 3,
          title: "Advanced Topics",
          lessons: [
            { id: 7, title: "Advanced Techniques", duration: "25 min", type: "video" as const, videoUrl: "", content: "", isCompleted: false },
            { id: 8, title: "Real-world Projects", duration: "30 min", type: "video" as const, videoUrl: "", content: "", isCompleted: false },
            { id: 9, title: "Final Assessment", duration: "20 min", type: "text" as const, videoUrl: "", content: "", isCompleted: false }
          ],
          progress: 0
        }
      ];
      
      const sampleProjects: Project[] = [
        {
          id: 1,
          title: "Project 1: Build Your First Application",
          description: "Create a basic application using the concepts learned in this course.",
          isSubmitted: false,
          score: undefined,
          feedback: undefined,
          isGrading: false
        },
        {
          id: 2,
          title: "Project 2: Advanced Implementation",
          description: "Implement advanced features and best practices.",
          isSubmitted: false,
          score: undefined,
          feedback: undefined,
          isGrading: false
        }
      ];
      
      generatedCourses.push({
        id: id,
        title: title,
        instructor: instructors[Math.floor(Math.random() * instructors.length)],
        category: category,
        price: Math.floor(Math.random() * 100) + 20,
        rating: parseFloat((4 + Math.random()).toFixed(1)),
        enrollmentCount: Math.floor(Math.random() * 5000) + 100,
        imageUrl: imageUrl,
        duration: `${Math.floor(Math.random() * 40) + 5} hours`,
        description: `Learn ${title} from industry experts. Master ${category} with hands-on projects and real-world examples. This comprehensive course will take you from beginner to advanced level.`,
        modules: 3,
        progress: 0,
        completed: false,
        content: sampleModules,
        projects: sampleProjects,
        reviews: [
          { id: 1, author: "John Doe", avatarUrl: "https://picsum.photos/seed/user1/40/40", rating: 5, comment: "Absolutely fantastic course! Highly recommended for anyone starting out." },
          { id: 2, author: "Jane Smith", avatarUrl: "https://picsum.photos/seed/user2/40/40", rating: 4, comment: "Very informative and well-paced. The projects were particularly helpful." },
          { id: 3, author: "Samuel Ade", avatarUrl: "https://picsum.photos/seed/user3/40/40", rating: 5, comment: "The instructor explains complex topics in a very simple way. Great value!" }
        ],
        isEnrolled: false,
        whatYouWillLearn: [
          "Master core concepts and advanced techniques",
          "Build real-world projects from scratch",
          "Get hands-on experience with practical exercises",
          "Learn from industry experts",
          "Access downloadable resources and materials",
          "Earn a certificate of completion"
        ],
        requirements: [
          "No prior experience required - we'll start from basics",
          "Computer with internet connection",
          "Willingness to learn and practice"
        ],
        instructorBio: `${instructors[Math.floor(Math.random() * instructors.length)]} is a passionate educator with over 10 years of experience in ${category}. They have helped thousands of students achieve their learning goals through practical, hands-on teaching methods.`
      });
      id++;
    });
  });
  
  return generatedCourses;
};

export const PublicCoursesPage: React.FC<PublicCoursesPageProps> = ({
  onNavigateToSignIn,
  onNavigateToSignUp,
  onEnrollmentSuccess,
  user,
  allCourses: initialCourses,
  onProjectSubmit,
  onToggleLessonComplete,
  onSendCourseMessage,
}) => {
  const { language } = useAppContext();
  const t = translations[language];
  
  const [selectedCourse, setSelectedCourse] = useState<CourseWithEnrollment | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CourseWithEnrollment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "price-low" | "price-high">("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [showFilters, setShowFilters] = useState(false);
  const coursesPerPage = 12;

  // Generate demo courses
  const allCourses = useMemo(() => {
    let courses = generateDemoCourses();
    
    // Update enrollment status based on user
    if (user && user.enrolledCourseIds && user.enrolledCourseIds.length > 0) {
      courses = courses.map(course => ({
        ...course,
        isEnrolled: user.enrolledCourseIds.includes(course.id)
      }));
    }
    
    return courses;
  }, [user]);

  const categories = useMemo(() => {
    const uniqueCategories = ["All", ...new Set(allCourses.map(course => course.category))];
    return uniqueCategories;
  }, [allCourses]);

  // Handle course selection - ALLOW ANYONE to view course details
  const handleCourseSelect = (course: CourseWithEnrollment) => {
    console.log("Course selected:", course.title);
    
    // Allow anyone to view course details (no login required)
    const fullCourse = allCourses.find(c => c.id === course.id);
    if (fullCourse) {
      setSelectedCourse(fullCourse);
      setShowCourseDetails(true);
      window.scrollTo(0, 0);
    }
  };

  const handleBackToCourses = () => {
    setShowCourseDetails(false);
    setSelectedCourse(null);
  };

  const handleEnrollmentSuccessLocal = (courseId: number) => {
    onEnrollmentSuccess(courseId);
    if (selectedCourse && selectedCourse.id === courseId) {
      setSelectedCourse({
        ...selectedCourse,
        isEnrolled: true
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    
    const results = allCourses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    setIsSearching(true);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    setCurrentPage(1);
  };

  const filteredCourses = useMemo(() => {
    let courses = isSearching ? searchResults : allCourses;
    
    if (!isSearching && activeCategory !== "All") {
      courses = courses.filter(course => course.category === activeCategory);
    }
    
    courses = courses.filter(course => 
      course.price >= priceRange[0] && course.price <= priceRange[1]
    );
    
    switch (sortBy) {
      case "popular":
        courses = [...courses].sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case "rating":
        courses = [...courses].sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        courses = [...courses].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        courses = [...courses].sort((a, b) => b.price - a.price);
        break;
    }
    
    return courses;
  }, [isSearching, searchResults, allCourses, activeCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, priceRange, sortBy]);

  // If showing course details, render the CourseDetails component
  // Pass user even if null - CourseDetails will handle showing landing page
  if (showCourseDetails && selectedCourse) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader 
          user={user} 
          onNavigateToSignIn={onNavigateToSignIn} 
          onNavigateToSignUp={onNavigateToSignUp} 
        />
        <main className="flex-1 pt-[73px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <CourseDetails
            user={user} 
            course={selectedCourse}
            allCourses={allCourses}
            onBack={handleBackToCourses}
            onProjectSubmit={onProjectSubmit || (() => {})}
            onToggleLessonComplete={onToggleLessonComplete || (() => {})}
            onEnrollmentSuccess={handleEnrollmentSuccessLocal}
            onSendCourseMessage={onSendCourseMessage || (() => {})}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="text-gray-800 font-sans bg-white min-h-screen flex flex-col">
      {/* Header */}
      <PublicHeader 
        user={user} 
        onNavigateToSignIn={onNavigateToSignIn} 
        onNavigateToSignUp={onNavigateToSignUp}
        searchQuery={searchQuery}
        onSearch={(query) => setSearchQuery(query)}
      />

      <main className="pt-[73px] flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isSearching 
                  ? `${t.searchResultsFor || "Search results for"} "${searchQuery}"` 
                  : t.broadSelection || "Browse Our Courses"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSearching 
                  ? `${filteredCourses.length} ${t.foundCourses?.replace('{count}', '') || "courses found"}`
                  : `${allCourses.length}+ ${t.selectionSubtitle || "courses to choose from"}`}
              </p>
            </div>
            
            {/* Sort and filter controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                <Icon name="filter" className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#219BD5]/20"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setPriceRange([0, 200]);
                      setSortBy("popular");
                    }}
                    className="px-4 py-2 text-sm text-[#219BD5] hover:text-[#1a7fb0] font-semibold"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          {!isSearching && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-gray-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                      ? 'bg-[#219BD5] text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Search Clear Button */}
          {isSearching && (
            <div className="mb-6">
              <button
                onClick={clearSearch}
                className="text-[#219BD5] hover:text-[#1a7fb0] font-semibold text-sm flex items-center gap-2"
              >
                <Icon name="arrow-left" className="w-4 h-4" />
                Back to All Courses
              </button>
            </div>
          )}

          {/* Course Grid */}
          {paginatedCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedCourses.map(course => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onCourseSelect={handleCourseSelect}
                    isRecommended={course.enrollmentCount > 3000}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#219BD5] text-white'
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? `No matches for "${searchQuery}"` : "Check back later for new courses"}
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
