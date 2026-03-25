"use client";

import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Admin } from '../../../components/Admin';
import { EditCourse } from '../../../components/EditCourse';

export default function AdminCoursesPage() {
  const { 
    currentUser, courses, editingCourse, setEditingCourse, users
  } = useAppContext();

  if (!currentUser || currentUser.role !== 'admin') return null;

  if (editingCourse) {
    return (
      <EditCourse
        course={editingCourse}
        allCourses={courses}
        onUpdateCourse={() => {}} // Placeholder
        onAddModule={() => {}} // Placeholder
        onAddLesson={() => {}} // Placeholder
        onDeleteLesson={() => {}} // Placeholder
        onAddWebinar={() => {}} // Placeholder
        onDeleteWebinar={() => {}} // Placeholder
        onBack={() => setEditingCourse(null)}
      />
    );
  }

  return (
    <Admin 
      users={users} 
      courses={courses} 
      onAddNewCourse={() => {}} 
      onSelectCourseToEdit={(course) => setEditingCourse(course)} 
      onDeleteCourse={() => {}} 
    />
  );
}
