"use client";

import React, { useState, useEffect } from 'react';
import type { User } from '../types';

type SettingsTab = 'Profile' | 'Security' | 'Notifications';

interface SettingsProps {
    user: User;
    onUserUpdate: (user: User) => void;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive ? 'bg-brand-primary text-white' : 'text-brand-muted hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        {label}
    </button>
);

const FormInput: React.FC<{ label: string; type: string; id: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean }> = ({ label, type, id, name, value, onChange, disabled }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-muted mb-2">{label}</label>
        <input 
            type={type} 
            id={id}
            name={name} 
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-brand-bg border border-gray-300 focus:border-brand-primary focus:ring-0 rounded-lg py-2 px-4 text-gray-900 placeholder-brand-muted transition disabled:opacity-50" 
        />
    </div>
);

const Toggle: React.FC<{ label: string; description: string; enabled: boolean }> = ({ label, description, enabled }) => {
    const [isEnabled, setIsEnabled] = useState(enabled);
    return (
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-brand-muted">{description}</p>
            </div>
            <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-brand-primary' : 'bg-gray-300'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );
};

export const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');
    const [formData, setFormData] = useState<User>(user);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = () => {
        // Simulate avatar change with a new random image
        const randomSeed = Math.random().toString(36).substring(7);
        setFormData(prev => ({ ...prev, avatarUrl: `https://picsum.photos/seed/${randomSeed}/100/100` }));
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        onUserUpdate(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-brand-muted mt-1">Manage your account and preferences.</p>
            </div>

            <div className="flex space-x-2 border-b border-gray-200 pb-2">
                <TabButton label="Profile" isActive={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
                <TabButton label="Security" isActive={activeTab === 'Security'} onClick={() => setActiveTab('Security')} />
                <TabButton label="Notifications" isActive={activeTab === 'Notifications'} onClick={() => setActiveTab('Notifications')} />
            </div>

            <div className="bg-brand-surface rounded-lg p-6 md:p-8 border border-gray-200">
                {activeTab === 'Profile' && (
                    <form onSubmit={handleSaveChanges} className="max-w-2xl space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Public Profile</h2>
                        <div className="flex items-center space-x-4">
                            <img src={formData.avatarUrl} alt="avatar" className="w-20 h-20 rounded-full"/>
                            <div>
                               <button type="button" onClick={handleAvatarChange} className="px-4 py-2 text-sm bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors">Change Avatar</button>
                               <p className="text-xs text-brand-muted mt-2">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>
                        <FormInput label="Full Name" type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                        <FormInput label="Email Address" type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                        <div className="flex items-center gap-4">
                             <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors">Save Changes</button>
                             {isSaved && <span className="text-brand-accent text-sm font-medium">Profile saved!</span>}
                        </div>
                    </form>
                )}
                {activeTab === 'Security' && (
                     <div className="max-w-2xl space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                        {/* The FormInput here is uncontrolled for simplicity as this is a demo */}
                        <FormInput label="Current Password" type="password" id="currentPassword" name="currentPassword" value="••••••••" onChange={() => {}} />
                        <FormInput label="New Password" type="password" id="newPassword" name="newPassword" value="" onChange={() => {}} />
                        <FormInput label="Confirm New Password" type="password" id="confirmPassword" name="confirmPassword" value="" onChange={() => {}} />
                         <div>
                             <button className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors">Update Password</button>
                        </div>
                    </div>
                )}
                 {activeTab === 'Notifications' && (
                     <div className="max-w-2xl space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
                        <Toggle label="Course Reminders" description="Get notified about your course progress." enabled={true} />
                        <Toggle label="New Course Announcements" description="Find out about new courses in topics you like." enabled={true} />
                        <Toggle label="Community Digest" description="Receive a weekly summary of community discussions." enabled={false} />
                    </div>
                )}
            </div>
        </div>
    );
};