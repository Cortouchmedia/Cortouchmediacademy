"use client";

import React, { useState } from 'react';
import type { Course, User } from '../types';
import { Icon } from './Icon';

interface AdminProps {
    users: User[];
    courses: Course[];
    onAddNewCourse: (courseData: { title: string; category: string; instructor: string; duration: string; description: string; imageUrl: string; price: number; prerequisiteCourseIds: number[] }) => void;
    onSelectCourseToEdit: (course: Course) => void;
    onDeleteCourse: (courseId: number) => void;
}

const initialFormState = {
    title: '',
    category: '',
    instructor: '',
    duration: '',
    description: '',
    imageUrl: '',
    price: 0,
    prerequisiteCourseIds: [] as number[],
};

export const Admin: React.FC<AdminProps> = ({ users, courses, onAddNewCourse, onSelectCourseToEdit, onDeleteCourse }) => {
    const [courseData, setCourseData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions).map(option => Number(option.value));
        setCourseData(prev => ({ ...prev, prerequisiteCourseIds: selectedIds }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            onAddNewCourse(courseData);
            setIsLoading(false);
            setIsSuccess(true);
            setCourseData(initialFormState);
            setTimeout(() => setIsSuccess(false), 3000); // Hide success message after 3 seconds
        }, 1500);
    };

    const getEnrolledCoursesForUser = (user: User) => {
        return courses.filter(course => user.enrolledCourseIds.includes(course.id));
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Course Management</h1>
                <p className="text-brand-muted mt-1 font-medium">Create and manage your academy's curriculum.</p>
            </div>
            
            <div className="bg-brand-surface rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add New Course</h2>
                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="title" className="block text-sm font-medium text-brand-muted mb-2">Course Title</label>
                            <input type="text" id="title" name="title" value={courseData.title} onChange={handleChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-brand-muted mb-2">Category</label>
                            <input type="text" id="category" name="category" value={courseData.category} onChange={handleChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                         <div>
                            <label htmlFor="instructor" className="block text-sm font-medium text-brand-muted mb-2">Instructor</label>
                            <input type="text" id="instructor" name="instructor" value={courseData.instructor} onChange={handleChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                         <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-brand-muted mb-2">Duration</label>
                            <input type="text" id="duration" name="duration" value={courseData.duration} onChange={handleChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-muted mb-2">Description</label>
                        <textarea id="description" name="description" value={courseData.description} onChange={handleChange} required rows={4} className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-brand-muted mb-2">Image URL</label>
                            <input type="text" id="imageUrl" name="imageUrl" value={courseData.imageUrl} onChange={handleChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" placeholder="https://picsum.photos/seed/new/600/400" />
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-brand-muted mb-2">Price (NGN)</label>
                            <input type="number" id="price" name="price" value={courseData.price} onChange={handleChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="prerequisites" className="block text-sm font-medium text-brand-muted mb-2">Prerequisites (optional)</label>
                        <select
                            id="prerequisites"
                            name="prerequisiteCourseIds"
                            multiple
                            value={courseData.prerequisiteCourseIds.map(String)}
                            onChange={handleSelectChange}
                            className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 h-32"
                        >
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                        <p className="text-xs text-brand-muted mt-1">Hold Ctrl/Cmd to select multiple courses.</p>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-48 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors flex justify-center items-center disabled:bg-opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Add Course'
                            )}
                        </button>
                        {isSuccess && (
                            <div className="flex items-center gap-2 text-brand-accent font-medium">
                                <Icon name="checkCircle" className="w-5 h-5" />
                                <span>Course added successfully!</span>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            
            <div className="bg-brand-surface rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Existing Courses</h2>
                <div className="space-y-4">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <img src={course.imageUrl} alt={course.title} className="w-24 h-16 object-cover rounded-md" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">{course.title}</h3>
                                    <p className="text-sm text-brand-muted">{course.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onSelectCourseToEdit(course)}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary transition-colors"
                                >
                                    <Icon name="edit" className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <button 
                                    onClick={() => onDeleteCourse(course.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Icon name="trash" className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};