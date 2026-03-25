"use client";

import React, { useState } from 'react';
import type { Course, Lesson, Webinar } from '../types';
import { Icon } from './Icon';

interface EditCourseProps {
    course: Course;
    allCourses: Course[];
    onBack: () => void;
    onUpdateCourse: (courseId: number, updatedDetails: Partial<Course>) => void;
    onAddModule: (courseId: number, title: string) => void;
    onAddLesson: (courseId: number, moduleId: number, lessonData: Omit<Lesson, 'id' | 'isCompleted'>) => void;
    onDeleteLesson: (courseId: number, lessonId: number) => void;
    onAddWebinar: (courseId: number, webinarData: Omit<Webinar, 'id'>) => void;
    onDeleteWebinar: (courseId: number, webinarId: number) => void;
}

const initialLessonState = { title: '', duration: '', type: 'video' as 'video' | 'text', videoUrl: '', content: '' };
const initialWebinarState = { title: '', date: '', status: 'upcoming' as 'live' | 'upcoming' | 'ended' };

export const EditCourse: React.FC<EditCourseProps> = ({ course, allCourses, onBack, onUpdateCourse, onAddModule, onAddLesson, onDeleteLesson, onAddWebinar, onDeleteWebinar }) => {
    const [details, setDetails] = useState({
        title: course.title,
        category: course.category,
        instructor: course.instructor,
        duration: course.duration,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        prerequisiteCourseIds: course.prerequisiteCourseIds || [],
    });
    const [isSaved, setIsSaved] = useState(false);
    
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<number | null>(null);
    const [newLessonData, setNewLessonData] = useState(initialLessonState);

    const [newWebinarData, setNewWebinarData] = useState(initialWebinarState);

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions).map(option => Number(option.value));
        setDetails(prev => ({ ...prev, prerequisiteCourseIds: selectedIds }));
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateCourse(course.id, details);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleAddModule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newModuleTitle.trim()) return;
        onAddModule(course.id, newModuleTitle);
        setNewModuleTitle('');
    };
    
    const handleAddLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLessonData.title.trim() || !addingLessonToModuleId) return;
        onAddLesson(course.id, addingLessonToModuleId, newLessonData);
        setNewLessonData(initialLessonState);
        setAddingLessonToModuleId(null);
    }
    
    const handleNewLessonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewLessonData(prev => ({...prev, [name]: value}));
    }

    const handleNewWebinarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewWebinarData(prev => ({ ...prev, [name]: value }));
    }

    const handleAddWebinar = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWebinarData.title.trim() || !newWebinarData.date.trim()) return;
        onAddWebinar(course.id, newWebinarData);
        setNewWebinarData(initialWebinarState);
    }

    return (
        <div className="space-y-8">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-800 hover:text-brand-primary mb-4">
                    <Icon name="chevronLeft" className="w-5 h-5" />
                    Back to Admin Panel
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Editing: {course.title}</h1>
                <p className="text-brand-muted mt-1">Update course details and manage content.</p>
            </div>

            {/* Edit Details Form */}
            <div className="bg-brand-surface rounded-lg p-6 md:p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Course Details</h2>
                <form onSubmit={handleDetailsSubmit} className="max-w-3xl space-y-6">
                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="title" className="block text-sm font-medium text-brand-muted mb-2">Course Title</label>
                            <input type="text" id="title" name="title" value={details.title} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-brand-muted mb-2">Category</label>
                            <input type="text" id="category" name="category" value={details.category} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                         <div>
                            <label htmlFor="instructor" className="block text-sm font-medium text-brand-muted mb-2">Instructor</label>
                            <input type="text" id="instructor" name="instructor" value={details.instructor} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                         <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-brand-muted mb-2">Duration</label>
                            <input type="text" id="duration" name="duration" value={details.duration} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-muted mb-2">Description</label>
                        <textarea id="description" name="description" value={details.description} onChange={handleDetailsChange} required rows={4} className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-brand-muted mb-2">Image URL</label>
                            <input type="text" id="imageUrl" name="imageUrl" value={details.imageUrl} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-brand-muted mb-2">Price (NGN)</label>
                            <input type="number" id="price" name="price" value={details.price} onChange={handleDetailsChange} required className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="prerequisites" className="block text-sm font-medium text-brand-muted mb-2">Prerequisites</label>
                        <select
                            id="prerequisites"
                            name="prerequisiteCourseIds"
                            multiple
                            value={details.prerequisiteCourseIds.map(String)}
                            onChange={handleSelectChange}
                            className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 h-32"
                        >
                            {allCourses.filter(c => c.id !== course.id).map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                        <p className="text-xs text-brand-muted mt-1">Hold Ctrl/Cmd to select multiple courses.</p>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                        <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors">Save Changes</button>
                        {isSaved && <span className="text-brand-accent text-sm font-medium flex items-center gap-2"><Icon name="checkCircle" className="w-5 h-5"/> Course details saved!</span>}
                    </div>
                </form>
            </div>

             {/* Manage Content */}
            <div className="bg-brand-surface rounded-lg p-6 md:p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Course Content</h2>
                <div className="space-y-4">
                    {course.content.map(module => (
                        <div key={module.id} className="bg-brand-bg/60 p-4 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-lg text-gray-800">{module.title}</h3>
                            <ul className="mt-2 space-y-2 pl-4">
                                {module.lessons.map(lesson => (
                                    <li key={lesson.id} className="flex items-center justify-between gap-2 text-sm text-brand-muted hover:bg-white/50 p-1 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <Icon name={lesson.type === 'video' ? 'play' : 'document'} className="w-4 h-4 text-brand-secondary"/>
                                            <span>{lesson.title} ({lesson.duration})</span>
                                        </div>
                                        <button onClick={() => onDeleteLesson(course.id, lesson.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                                {module.lessons.length === 0 && <p className="text-sm text-brand-muted italic">No lessons in this module yet.</p>}
                            </ul>
                            
                            {addingLessonToModuleId === module.id ? (
                                <form onSubmit={handleAddLesson} className="mt-4 p-4 bg-white border border-brand-primary/20 rounded-lg space-y-4">
                                    <h4 className="font-semibold text-gray-800">Add New Lesson</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" name="title" value={newLessonData.title} onChange={handleNewLessonChange} placeholder="Lesson Title" required className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                                        <input type="text" name="duration" value={newLessonData.duration} onChange={handleNewLessonChange} placeholder="Duration (e.g., 15 min)" required className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                                    </div>
                                    <select name="type" value={newLessonData.type} onChange={handleNewLessonChange} className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm">
                                        <option value="video">Video</option>
                                        <option value="text">Text</option>
                                    </select>
                                    {newLessonData.type === 'video' ? (
                                        <input type="text" name="videoUrl" value={newLessonData.videoUrl} onChange={handleNewLessonChange} placeholder="YouTube Embed URL" className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                                    ) : (
                                        <textarea name="content" value={newLessonData.content} onChange={handleNewLessonChange} placeholder="Lesson text content..." rows={3} className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm"></textarea>
                                    )}
                                    <div className="flex gap-2">
                                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-80">Save Lesson</button>
                                        <button type="button" onClick={() => setAddingLessonToModuleId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                                    </div>
                                </form>
                            ) : (
                                <button onClick={() => setAddingLessonToModuleId(module.id)} className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-brand-secondary/20 text-brand-secondary text-sm font-semibold rounded-md hover:bg-brand-secondary/30 transition-colors">
                                    <Icon name="plus" className="w-4 h-4"/> Add Lesson
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                <form onSubmit={handleAddModule} className="mt-6 flex items-center gap-3 pt-6 border-t border-gray-200">
                    <input
                        type="text"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        placeholder="New module title..."
                        className="flex-1 bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4"
                    />
                    <button type="submit" className="px-6 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors">Add Module</button>
                </form>
            </div>

            {/* Manage Webinars */}
            <div className="bg-brand-surface rounded-lg p-6 md:p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manage Webinars</h2>
                <div className="space-y-3 mb-6">
                    {(course.webinars || []).map(webinar => (
                        <div key={webinar.id} className="flex items-center justify-between bg-brand-bg/60 p-3 rounded-md border">
                            <div>
                                <p className="font-semibold text-gray-800">{webinar.title}</p>
                                <p className="text-sm text-brand-muted">{webinar.date} - <span className="capitalize font-medium">{webinar.status}</span></p>
                            </div>
                            <button onClick={() => onDeleteWebinar(course.id, webinar.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                <Icon name="trash" className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {(course.webinars || []).length === 0 && (
                        <p className="text-center text-brand-muted py-4">No webinars scheduled yet.</p>
                    )}
                </div>
                <form onSubmit={handleAddWebinar} className="p-4 bg-white border border-brand-primary/20 rounded-lg space-y-4">
                    <h4 className="font-semibold text-gray-800">Add New Webinar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" name="title" value={newWebinarData.title} onChange={handleNewWebinarChange} placeholder="Webinar Title" required className="md:col-span-2 w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                        <input type="text" name="date" value={newWebinarData.date} onChange={handleNewWebinarChange} placeholder="Date & Time (e.g., July 10, 2024 @ 2:00 PM)" required className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select name="status" value={newWebinarData.status} onChange={handleNewWebinarChange} className="w-full bg-white border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-sm">
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="ended">Ended</option>
                        </select>
                        <button type="submit" className="md:col-span-2 px-4 py-2 bg-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-opacity-80 w-full">Add Webinar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};