"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { CourseCard } from "./CourseCard";
import { PublicHeader } from "./PublicHeader";
import { Footer } from "./Footer";
import { useAppContext } from "../context/AppContext";
import { translations } from "../constants/translations";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Course, CourseWithEnrollment } from "../types";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const { language } = useAppContext();
  const t = translations[language];
  const router = useRouter();
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

  // Get courses by category from the courses prop
  const getCoursesByCategory = (category: string): Course[] => {
    return courses.filter(course => course.category === category);
  };

  // Search function using the courses prop
  const handleSearch = (query: string, shouldScroll: boolean = false) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setIsSearching(false);
      setSearchResults([]);
    } else {
      const results = courses.filter(course => 
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
    <div className="text-gray-800 font-sans bg-white min-h-screen flex flex-col">
      {/* Header */}
      <PublicHeader 
        user={null} 
        onNavigateToSignIn={onNavigateToSignIn} 
        onNavigateToSignUp={onNavigateToSignUp}
        searchQuery={searchQuery}
        onSearch={(query) => handleSearch(query)}
        scrolledEffect={true}
      />

      <main className="pt-[65px] flex-1">
        {/* Hero Section - Wide Background, Boxed Content */}
        <section className="relative h-[450px] lg:h-[500px] overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="Professional in modern office workspace" 
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16 h-full flex items-center relative z-10">
            <div className="bg-white p-8 lg:p-10 rounded-lg shadow-2xl max-w-md">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {t.heroTitle}
              </h1>
              <p className="text-gray-600 mb-6 text-base leading-relaxed">
                {t.heroSubtitle}
              </p>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={t.whatToLearn} 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery, true)}
                  className="w-full border border-gray-300 focus:border-[#219BD5] py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-[#219BD5] rounded-lg"
                />
                <button 
                  onClick={() => handleSearch(searchQuery, true)}
                  className="absolute right-0 top-0 bottom-0 px-4 bg-[#219BD5] text-white hover:bg-[#1a7fb0] transition-colors font-semibold rounded-r-lg"
                >
                  <Icon name="search" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <p className="text-center text-gray-600 mb-8 text-lg">{t.trustedBy}</p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60">
              {['Volkswagen', 'Samsung', 'Cisco', 'AT&T', 'Procter & Gamble', 'Hewlett Packard'].map(partner => (
                <div key={partner} className="text-xl lg:text-2xl font-bold text-gray-400 font-serif">{partner}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Broad Selection Section with Interactive Tabs */}
        <section id="courses" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900">
                {isSearching ? `${t.searchResultsFor} "${searchQuery}"` : t.broadSelection}
              </h2>
              {isSearching && (
                <button
                  onClick={clearSearch}
                  className="text-[#219BD5] hover:text-[#1a7fb0] font-semibold text-sm"
                >
                  {t.clearSearch}
                </button>
              )}
            </div>
            <p className="text-lg text-gray-600 mb-8">
              {isSearching 
                ? t.foundCourses.replace('{count}', searchResults.length.toString())
                : t.selectionSubtitle}
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
                    {cat === "Python" ? "Python" 
                      : cat === "Excel" ? "Excel"
                      : cat === "Web Development" ? t.categoryDevelopment
                      : cat === "JavaScript" ? "JavaScript"
                      : cat === "Data Science" ? "Data Science"
                      : cat === "Amazon AWS" ? "Amazon AWS"
                      : t.categoryDesign}
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
                      ? t.catWebTitle
                      : activeCategory === "Python"
                      ? t.catPythonTitle
                      : activeCategory === "Excel"
                      ? t.catExcelTitle
                      : activeCategory === "JavaScript"
                      ? t.catJSTitle
                      : activeCategory === "Data Science"
                      ? t.catDSTitle
                      : activeCategory === "Amazon AWS"
                      ? t.catAWSTitle
                      : t.catDrawTitle}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeCategory === "Web Development" 
                      ? t.catWebDesc
                      : activeCategory === "Python"
                      ? t.catPythonDesc
                      : activeCategory === "Excel"
                      ? t.catExcelDesc
                      : activeCategory === "JavaScript"
                      ? t.catJSDesc
                      : activeCategory === "Data Science"
                      ? t.catDSDesc
                      : activeCategory === "Amazon AWS"
                      ? t.catAWSDesc
                      : t.catDrawDesc}
                  </p>
                  <button 
                    onClick={() => router.push(`/courses?category=${encodeURIComponent(activeCategory)}`)}
                    className="px-4 py-2 border border-[#219BD5] text-[#219BD5] font-bold text-sm hover:bg-[#219BD5] hover:text-white transition-colors"
                  >
                    {t.explore} {activeCategory === "Web Development" ? t.categoryDevelopment : activeCategory === "Drawing" ? t.categoryDesign : activeCategory}
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
                      onCourseSelect={(course) => router.push(`/courses/${course.id}`)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t.noCoursesFound}</h3>
                  <p className="text-gray-500 mb-4">
                    {t.noMatchesFor.replace('{query}', searchQuery)}
                  </p>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-[#219BD5] text-white rounded-lg hover:bg-[#1a7fb0] transition-colors"
                  >
                    {t.clearSearch}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t.topCategories}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: t.categoryDesign, img: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: t.categoryDevelopment, img: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: t.categoryMarketing, img: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: t.categoryIT, img: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: t.categoryPersonalDev, img: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: t.categoryBusiness, img: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: t.categoryPhotography, img: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
                { name: t.categoryMusic, img: 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop' },
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#219BD5] rounded-full flex items-center justify-center mb-4">
                  <Icon name="play" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.onlineCourses}</h3>
                <p className="text-sm text-gray-600">{t.freshTopics}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#219BD5] rounded-full flex items-center justify-center mb-4">
                  <Icon name="star" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.expertInstruction}</h3>
                <p className="text-sm text-gray-600">{t.findInstructor}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#219BD5] rounded-full flex items-center justify-center mb-4">
                  <Icon name="shield" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.lifetimeAccess}</h3>
                <p className="text-sm text-gray-600">{t.learnSchedule}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Instructor Theme */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <img src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop" alt="Instructor teaching" className="w-full rounded-sm shadow-lg" referrerPolicy="no-referrer" />
              </div>
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">{t.becomeInstructor}</h2>
                <p className="text-lg text-gray-600 mb-8">{t.instructorSubtitle}</p>
                <button
                  onClick={onNavigateToSignUp}
                  className="px-8 py-3 bg-[#219BD5] text-white font-bold hover:bg-[#1a7fb0] transition-all"
                >
                  {t.startTeaching}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
