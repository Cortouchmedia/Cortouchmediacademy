"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "./Icon";
import { CourseCard } from "./CourseCard";
import { CourseDetails } from "./CourseDetails";
import { PublicHeader } from "./PublicHeader";
import { Footer } from "./Footer";
import { useAppContext } from "../context/AppContext";
import { translations } from "../constants/translations";
import type { CourseWithEnrollment, User } from "../types";
import { useRouter } from "next/navigation";

interface PublicCoursesPageProps {
  user: User | null;
  allCourses: CourseWithEnrollment[];
}

export const PublicCoursesPage: React.FC<PublicCoursesPageProps> = ({
  user,
  allCourses: initialCourses,
}) => {
  const { language, handleEnrollmentSuccess } = useAppContext();
  const t = translations[language];
  const router = useRouter();

  const onNavigateToSignIn = () => router.push("/login");
  const onNavigateToSignUp = () => router.push("/signup");
  const onEnrollmentSuccess = handleEnrollmentSuccess;

  const [selectedCourse, setSelectedCourse] =
    useState<CourseWithEnrollment | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CourseWithEnrollment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "popular" | "rating" | "price-low" | "price-high"
  >("popular");
  const [showFilters, setShowFilters] = useState(false);
  const coursesPerPage = 12;

  const allCourses = useMemo(() => {
    const source = initialCourses ?? [];
    if (user?.enrolledCourseIds?.length) {
      return source.map((course) => ({
        ...course,
        isEnrolled: user.enrolledCourseIds!.includes(course.id as any),
      }));
    }
    return source;
  }, [user, initialCourses]);

  // Dynamic max price based on actual data (so the filter never hides
  // everything by default)
  const maxPrice = useMemo(() => {
    const prices = allCourses
      .map((c) => Number(c.price))
      .filter((p) => Number.isFinite(p) && p > 0);
    return prices.length ? Math.max(...prices) : 100;
  }, [allCourses]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // Initialize / reset the upper bound when the data changes
  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Normalize categories: trims, dedupes case-insensitively, sorts
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    allCourses.forEach((c) => {
      const raw = (c.category ?? "General").toString();
      const trimmed = raw.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      if (!seen.has(key)) seen.set(key, trimmed);
    });
    return ["All", ...Array.from(seen.values()).sort()];
  }, [allCourses]);

  const handleCourseSelect = (course: CourseWithEnrollment) => {
    const fullCourse = allCourses.find(
      (c) => String(c.id) === String(course.id),
    );
    if (fullCourse) {
      setSelectedCourse(fullCourse);
      setShowCourseDetails(true);
      window.scrollTo(0, 0);
    }
  };

  const handleEnrollmentSuccessLocal = (courseId: number) => {
    onEnrollmentSuccess(courseId);
    if (selectedCourse && selectedCourse.id === courseId) {
      setSelectedCourse({ ...selectedCourse, isEnrolled: true });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = allCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
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
      const active = activeCategory.trim().toLowerCase();
      courses = courses.filter(
        (c) => (c.category ?? "").trim().toLowerCase() === active,
      );
    }

    // Only apply price filter when the user has narrowed the range
    if (priceRange[1] < maxPrice) {
      courses = courses.filter(
        (c) => c.price >= priceRange[0] && c.price <= priceRange[1],
      );
    }

    switch (sortBy) {
      case "popular":
        courses = [...courses].sort(
          (a, b) => b.enrollmentCount - a.enrollmentCount,
        );
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
  }, [
    isSearching,
    searchResults,
    allCourses,
    activeCategory,
    priceRange,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, priceRange, sortBy]);

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
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="text-gray-800 font-sans bg-white min-h-screen flex flex-col">
      <PublicHeader
        user={user}
        onNavigateToSignIn={onNavigateToSignIn}
        onNavigateToSignUp={onNavigateToSignUp}
        searchQuery={searchQuery}
        onSearch={(query) => setSearchQuery(query)}
      />

      <main className="pt-[73px] flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isSearching
                  ? `${t.searchResultsFor || "Search results for"} "${searchQuery}"`
                  : t.broadSelection || "Browse Our Courses"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSearching
                  ? `${filteredCourses.length} ${
                      t.foundCourses?.replace("{count}", "") || "courses found"
                    }`
                  : `${allCourses.length}+ ${
                      t.selectionSubtitle || "courses to choose from"
                    }`}
              </p>
            </div>

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

          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range: {priceRange[0].toLocaleString()} –{" "}
                    {priceRange[1].toLocaleString()}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={Math.max(1, Math.floor(maxPrice / 100))}
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={Math.max(1, Math.floor(maxPrice / 100))}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setPriceRange([0, maxPrice]);
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

          {!isSearching && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-gray-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-[#219BD5] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

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

          {paginatedCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onCourseSelect={handleCourseSelect}
                    isRecommended={course.enrollmentCount > 3000}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2)
                        pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#219BD5] text-white"
                              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? `No matches for "${searchQuery}"`
                  : "Check back later for new courses"}
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

      <Footer />
    </div>
  );
};