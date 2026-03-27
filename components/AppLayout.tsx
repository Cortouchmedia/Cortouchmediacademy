"use client";

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Header } from './Header';
import { ChatWidget } from './ChatWidget';
import { CompletionModal } from './CompletionModal';
import ErrorBoundary from './ErrorBoundary';
import { usePathname, useRouter } from 'next/navigation';
import { LandingPage } from './LandingPage';
import { SignInPage } from './SignInPage';
import { SignUpPage } from './SignUpPage';
import { AdminSignInPage } from './AdminSignInPage';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    isLoggedIn, currentUser, currentPage, selectedCourse, editingCourse, completedCourse,
    isChatOpen, isBotTyping, messages, searchQuery,
    handleLogin, handleLogout, handleNavigate, handleSearchChange,
    setIsChatOpen, setCompletedCourse, courses
  } = useAppContext();

  const pathname = usePathname();
  const router = useRouter();

  // Sync currentPage with pathname
  React.useEffect(() => {
    if (isLoggedIn && currentUser) {
      const path = pathname.split('/')[1];
      if (path === 'student-dashboard') handleNavigate('Dashboard');
      else if (path === 'instructor-dashboard') handleNavigate('Instructor Dashboard');
      else if (path === 'instructor-courses') handleNavigate('Instructor Courses');
      else if (path === 'instructor-students') handleNavigate('Instructor Students');
      else if (path === 'instructor-revenue') handleNavigate('Instructor Revenue');
      else if (path === 'catalog') handleNavigate('Catalog');
      else if (path === 'my-courses') handleNavigate('My Courses');
      else if (path === 'certificates') handleNavigate('Certificates');
      else if (path === 'community') handleNavigate('Community');
      else if (path === 'settings') handleNavigate('Settings');
      else if (path === 'profile') handleNavigate('Profile');
      else if (path === 'about') handleNavigate('About Us');
      else if (path === 'admin') handleNavigate('Admin');
      else if (path === 'course') {
        // We don't call handleNavigate here to avoid resetting selectedCourse if it's already set
        // But we might want to ensure the state reflects we are in a course
      }
      else if (path === 'search') {
        // Similar for search
      }
    }
  }, [pathname, isLoggedIn, currentUser]);

  // Handle redirects based on role when on root path
  React.useEffect(() => {
    if (isLoggedIn && currentUser && pathname === '/') {
      if (currentUser.role === 'admin') {
        router.push('/admin');
      } else if (currentUser.role === 'instructor') {
        router.push('/instructor-dashboard');
      } else {
        router.push('/student-dashboard');
      }
    }
  }, [isLoggedIn, currentUser, pathname, router]);

  const [authView, setAuthView] = React.useState<'landing' | 'signIn' | 'signUp'>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const isAdminRoute = pathname.startsWith('/admin');

  const handleNavigateToSignUp = () => {
    router.push('/signup');
    setAuthView('signUp');
  };
  const handleNavigateToSignIn = () => {
    if (pathname.startsWith('/admin')) {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
    setAuthView('signIn');
  };

  if (!isLoggedIn || !currentUser) {
    if (pathname === '/admin/login') {
      return <AdminSignInPage onSignIn={(role) => {
        handleLogin(role);
        router.push('/admin');
      }} />;
    }

    if (pathname === '/login') {
      return <SignInPage onSignIn={(role) => {
        handleLogin(role);
        if (role === 'instructor') router.push('/instructor-dashboard');
        else if (role === 'admin') router.push('/admin');
        else router.push('/student-dashboard');
      }} onNavigateToSignUp={handleNavigateToSignUp} />;
    }

    if (pathname === '/signup' || authView === 'signUp') {
      return <SignUpPage onSignUp={(role) => {
        handleLogin(role);
        if (role === 'instructor') router.push('/instructor-dashboard');
        else if (role === 'admin') router.push('/admin');
        else router.push('/student-dashboard');
      }} onNavigateToSignIn={handleNavigateToSignIn} />;
    }
    
    // Default landing page for other routes when not logged in
    return <LandingPage onNavigateToSignIn={handleNavigateToSignIn} onNavigateToSignUp={handleNavigateToSignUp} courses={courses} />;
  }

  // Prevent rendering root content if we're about to redirect
  if (pathname === '/') {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen font-sans bg-brand-bg">
        <div className="flex min-h-screen relative">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:block`}>
            {isAdminRoute && currentUser.role === 'admin' ? (
              <AdminSidebar user={currentUser} onLogout={handleLogout} />
            ) : (
              <Sidebar 
                user={currentUser} 
                activePage={currentPage} 
                onNavigate={(page) => {
                  handleNavigate(page);
                  let path = page.toLowerCase().replace(/\s+/g, '-');
                  if (path === 'dashboard') path = 'student-dashboard';
                  router.push(`/${path}`);
                  setIsSidebarOpen(false);
                }} 
                onLogout={handleLogout}
              />
            )}
          </div>

          <main className="flex-1 flex flex-col min-w-0">
            <Header
              user={currentUser}
              currentPage={isAdminRoute ? 'Admin Portal' : searchQuery ? 'Search Results' : editingCourse ? 'Edit Course' : selectedCourse ? 'Course Details' : currentPage}
              searchQuery={searchQuery}
              onSearchChange={(query) => {
                handleSearchChange(query);
                if (query) router.push('/search');
              }}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onNavigateToProfile={() => {
                handleNavigate('Profile');
                router.push('/profile');
              }}
            />
            <div className="p-4 lg:p-8 overflow-y-auto flex-1">
              {children}
            </div>
          </main>
          {!isAdminRoute && (
            <ChatWidget
              isOpen={isChatOpen}
              onToggle={() => setIsChatOpen(!isChatOpen)}
              messages={messages}
              onSendMessage={(text) => {}} // This will be handled by context
              isBotTyping={isBotTyping}
            />
          )}
          {completedCourse && <CompletionModal course={completedCourse} onClose={() => setCompletedCourse(null)} onNavigate={handleNavigate} />}
        </div>
      </div>
    </ErrorBoundary>
  );
}
