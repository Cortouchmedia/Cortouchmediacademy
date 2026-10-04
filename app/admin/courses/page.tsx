"use client";

import React from "react";
import { useAppContext } from "../../../context/AppContext";
import { Admin } from "../../../components/Admin";
import { EditCourse } from "../../../components/EditCourse";

export default function AdminCoursesPage() {
  const {
    currentUser,
    courses,
    editingCourse,
    setEditingCourse,
    users,
    handleCourseUpdate,
    handleCourseDelete,
    handleModuleAdd,
    handleLessonAdd,
    handleLessonDelete,
    handleWebinarAdd,
    handleWebinarDelete,
    handleInstructorCourseAdd,
    handleProjectAdd,
    handleProjectDelete,
    handleAIGrade,
    handleApproveGrade,
  } = useAppContext();

  if (!currentUser || currentUser.role !== "admin") return null;

  if (editingCourse) {
    return (
      <EditCourse
        course={editingCourse}
        allCourses={courses}
        onUpdateCourse={handleCourseUpdate}
        onAddModule={handleModuleAdd}
        onAddLesson={handleLessonAdd}
        onDeleteLesson={handleLessonDelete}
        onAddWebinar={handleWebinarAdd}
        onDeleteWebinar={handleWebinarDelete}
        onAddProject={handleProjectAdd}
        onDeleteProject={handleProjectDelete}
        onAIGrade={handleAIGrade}
        onApproveGrade={handleApproveGrade}
        onBack={() => setEditingCourse(null)}
      />
    );
  }

  return (
    <Admin
      users={users}
      courses={courses}
      onAddNewCourse={async (data) => {
        await handleInstructorCourseAdd({
          ...data,
          modules: 0,
          whatYouWillLearn: [],
          requirements: [],
          instructorBio: "Expert instructor at Cortouch Academy.",
          features: ["Hands-on projects", "Certificate of completion"],
        });
      }}
      onSelectCourseToEdit={(course) => setEditingCourse(course)}
      onDeleteCourse={handleCourseDelete}
    />
  );
}