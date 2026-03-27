"use client";

import React, { useState } from 'react';
import { User } from '../types';
import { Icon } from './Icon';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    bio: user.role === 'admin' ? 'System Administrator with full access to academy management tools.' : user.role === 'instructor' ? 'Experienced educator passionate about sharing knowledge.' : 'Learning enthusiast exploring new horizons.',
    location: user.role === 'admin' ? 'HQ - Lagos, Nigeria' : 'Lagos, Nigeria',
    website: 'https://example.com'
  });

  const handleSave = () => {
    onUpdateUser({ name: formData.name, email: formData.email });
    setIsEditing(false);
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Header/Cover */}
        <div className={`h-32 sm:h-48 bg-gradient-to-r ${isAdmin ? 'from-gray-900 to-gray-700' : 'from-brand-primary to-[#219BD5]'}`}></div>
        
        <div className="px-6 pb-8">
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 mb-6 gap-4 sm:gap-6">
            <div className="relative">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg object-cover bg-white ${isAdmin ? 'ring-4 ring-gray-900/10' : ''}`}
              />
              {isEditing && (
                <button className="absolute bottom-2 right-2 p-2 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary/90 transition-colors">
                  <Icon name="camera" className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-center sm:self-auto ${
                  isAdmin ? 'bg-gray-900 text-white' : 'bg-brand-primary/10 text-brand-primary'
                }`}>
                  {isAdmin ? 'System Admin' : user.role}
                </span>
              </div>
              <p className="text-brand-muted mt-1">{user.email}</p>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                    isAdmin 
                      ? 'text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white' 
                      : 'text-brand-primary border border-brand-primary hover:bg-brand-primary/5'
                  }`}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name={isAdmin ? "settings" : "user"} className={`w-5 h-5 ${isAdmin ? 'text-gray-900' : 'text-brand-primary'}`} />
                  {isAdmin ? 'Administrative Bio' : 'About Me'}
                </h2>
                {isEditing ? (
                  <textarea 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {formData.bio}
                  </p>
                )}
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input 
                      type="email"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                  {isEditing ? (
                    <input 
                      type="url"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                    />
                  ) : (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-medium">
                      {formData.website.replace('https://', '')}
                    </a>
                  )}
                </div>
              </section>

              {isAdmin && (
                <section className="pt-6 border-t border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="shield" className="w-5 h-5 text-gray-900" />
                    Admin Privileges
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Access Level</p>
                      <p className="text-sm font-bold text-gray-900">Full Academy Control</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Security Status</p>
                      <p className="text-sm font-bold text-green-600">Verified Administrator</p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Stats/Badges */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  {isAdmin ? 'Admin Stats' : 'Account Stats'}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Joined</span>
                    <span className="text-gray-900 font-semibold text-sm">March 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">
                      {isAdmin ? 'System Access' : 'Courses'}
                    </span>
                    <span className="text-gray-900 font-semibold text-sm">
                      {isAdmin ? 'Unlimited' : user.role === 'instructor' ? '12 Published' : `${user.enrolledCourseIds.length} Enrolled`}
                    </span>
                  </div>
                  {user.role === 'student' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Certificates</span>
                      <span className="text-gray-900 font-semibold text-sm">4 Earned</span>
                    </div>
                  )}
                  {user.role === 'instructor' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Total Students</span>
                      <span className="text-gray-900 font-semibold text-sm">1,240</span>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Admin Level</span>
                      <span className="text-gray-900 font-semibold text-sm">Super Admin</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Social Links</h3>
                <div className="flex gap-4">
                  <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-all">
                    <Icon name="twitter" className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-all">
                    <Icon name="linkedin" className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-brand-primary hover:border-brand-primary transition-all">
                    <Icon name="instagram" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
