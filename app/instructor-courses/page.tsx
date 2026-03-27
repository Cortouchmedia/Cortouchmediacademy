"use client";

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { Icon } from '../../components/Icon';
import { EditCourse } from '../../components/EditCourse';

export default function InstructorCoursesPage() {
  const { 
    currentUser, courses, handleCourseSelect, handleInstructorCourseAdd,
    editingCourse, setEditingCourse, handleCourseUpdate, handleModuleAdd, 
    handleLessonAdd, handleLessonDelete, handleWebinarAdd, handleWebinarDelete
  } = useAppContext();
  const router = useRouter();
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: '',
    description: '',
    imageUrl: '',
    price: 0,
    duration: '',
  });
  const [initialModules, setInitialModules] = useState([{ title: '' }]);

  if (!currentUser || currentUser.role !== 'instructor') return null;

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
        onBack={() => setEditingCourse(null)}
      />
    );
  }

  const instructorCourses = courses.filter(c => c.instructor === currentUser.name);

  const addModuleField = () => setInitialModules([...initialModules, { title: '' }]);
  const removeModuleField = (index: number) => {
    if (initialModules.length > 1) {
      setInitialModules(initialModules.filter((_, i) => i !== index));
    }
  };
  const updateModuleField = (index: number, title: string) => {
    const updated = [...initialModules];
    updated[index].title = title;
    setInitialModules(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modulesToAdd = initialModules.filter(m => m.title.trim() !== '');
    handleInstructorCourseAdd({
      ...newCourse,
      instructor: currentUser.name,
      instructorBio: 'Expert instructor at Cortouch Academy.',
      whatYouWillLearn: [],
      requirements: [],
      features: ['Hands-on projects', 'Certificate of completion'],
      modules: modulesToAdd.length,
    }, modulesToAdd);
    setIsAddingCourse(false);
    setNewCourse({ title: '', category: '', description: '', imageUrl: '', price: 0, duration: '' });
    setInitialModules([{ title: '' }]);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Courses</h1>
          <p className="text-gray-500 mt-1">Manage and edit your course content.</p>
        </div>
        <button 
          onClick={() => setIsAddingCourse(true)}
          className="px-6 py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-all flex items-center gap-2"
        >
          <Icon name="plus" className="w-5 h-5" />
          Create New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructorCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
            <div className="relative h-48" onClick={() => {
              handleCourseSelect(course);
              router.push(`/course/${course.id}`);
            }}>
              <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{course.title}</h3>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{course.enrollmentCount.toLocaleString()} students</span>
                <span className="font-bold text-green-600">Active</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCourse(course);
                  }}
                  className="flex-1 py-2 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="edit" className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseSelect(course);
                    router.push(`/course/${course.id}`);
                  }}
                  className="flex-1 py-2 bg-[#219BD5] text-white font-bold rounded-lg hover:bg-[#1a7fb0] transition-all"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
        <div 
          onClick={() => setIsAddingCourse(true)}
          className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-12 text-center hover:border-[#219BD5] transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <span className="text-2xl text-[#219BD5]">+</span>
          </div>
          <h3 className="font-bold text-gray-900">Create New Course</h3>
          <p className="text-sm text-gray-500 mt-1">Start building your next masterpiece.</p>
        </div>
      </div>

      {isAddingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
              <button onClick={() => setIsAddingCourse(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="x" className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Course Title</label>
                    <input 
                      type="text" 
                      required 
                      value={newCourse.title}
                      onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                      placeholder="e.g. Advanced Photography"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Category</label>
                    <input 
                      type="text" 
                      required 
                      value={newCourse.category}
                      onChange={e => setNewCourse({...newCourse, category: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                      placeholder="e.g. Creative Arts"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Price (NGN)</label>
                    <input 
                      type="number" 
                      required 
                      value={newCourse.price}
                      onChange={e => setNewCourse({...newCourse, price: Number(e.target.value)})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Duration</label>
                    <input 
                      type="text" 
                      required 
                      value={newCourse.duration}
                      onChange={e => setNewCourse({...newCourse, duration: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                      placeholder="e.g. 4 Weeks"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Image URL</label>
                  <input 
                    type="url" 
                    required 
                    value={newCourse.imageUrl}
                    onChange={e => setNewCourse({...newCourse, imageUrl: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea 
                    required 
                    rows={3}
                    value={newCourse.description}
                    onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none resize-none"
                    placeholder="Tell students what they will learn..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-900">Curriculum (Modules)</h3>
                  <button 
                    type="button"
                    onClick={addModuleField}
                    className="text-sm font-bold text-[#219BD5] flex items-center gap-1 hover:underline"
                  >
                    <Icon name="plus" className="w-4 h-4" />
                    Add Module
                  </button>
                </div>
                <div className="space-y-3">
                  {initialModules.map((module, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={module.title}
                          onChange={e => updateModuleField(index, e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#219BD5] outline-none"
                          placeholder={`Module ${index + 1} Title`}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeModuleField(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Module"
                      >
                        <Icon name="trash" className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 italic">You can add lessons to these modules after creating the course by clicking "Edit".</p>
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white py-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddingCourse(false)} className="flex-1 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#219BD5] text-white font-bold rounded-xl hover:bg-[#1a7fb0] transition-all">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
