"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { useAppContext } from '../context/AppContext';
import { Api, authStorage } from '@/lib/api';

type SettingsTab = 'Profile' | 'Security' | 'Notifications';

interface SettingsProps {
  user: User;
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

const FormInput: React.FC<{
  label: string;
  type: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ label, type, id, name, value, onChange, disabled }) => (
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

export const Settings: React.FC<SettingsProps> = ({ user }) => {
  const { handleUserUpdate: onUserUpdate } = useAppContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');
  const [formData, setFormData] = useState<User>(user);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const token = authStorage.getToken();
      if (!token) {
        throw new Error('Please sign in again');
      }

      console.log('🟢 uploading avatar…', file.name, file.size);
      const result = await Api.assets.upload(
        file,
        {
          entityType: 'user',
          entityId: user.id,
          type: 'avatar',
        },
        token,
      );

      console.log('🟢 upload success:', result);

      // Backend updates profiles.profile_picture via updateEntityImage().
      // Use the medium variant (or fall back to original URL) for the avatar.
      const newUrl =
        result?.variants?.medium ??
        result?.variants?.original ??
        result?.asset?.url;

      if (!newUrl) {
        throw new Error('Upload succeeded but no URL returned');
      }

      // Update local state
      setFormData((prev) => ({ ...prev, avatarUrl: newUrl }));

      // Sync parent state so the rest of the app sees the new avatar
      onUserUpdate({ ...formData, avatarUrl: newUrl });

      // Persist to localStorage so refresh keeps the new avatar
      if (typeof window !== 'undefined') {
        const storedUserStr = localStorage.getItem('auth_user');
        if (storedUserStr) {
          try {
            const storedUser = JSON.parse(storedUserStr);
            storedUser.avatarUrl = newUrl;
            localStorage.setItem('auth_user', JSON.stringify(storedUser));
          } catch {}
        }
      }
    } catch (err) {
      console.error('🔴 upload failed:', err);
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    try {
      const token = authStorage.getToken();
      if (!token) {
        throw new Error('Please sign in again');
      }

      await Api.auth.updateUser(
        user.id,
        {
          full_name: formData.name,
        },
        token,
      );

      onUserUpdate(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        const storedUserStr = localStorage.getItem('auth_user');
        if (storedUserStr) {
          try {
            const storedUser = JSON.parse(storedUserStr);
            storedUser.name = formData.name;
            localStorage.setItem('auth_user', JSON.stringify(storedUser));
          } catch {}
        }
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
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
              <img
                src={formData.avatarUrl}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border border-gray-200"
              />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-60"
                >
                  {isUploading ? 'Uploading…' : 'Change Avatar'}
                </button>
                <p className="text-xs text-brand-muted mt-2">JPG, GIF or PNG. 5MB max.</p>
              </div>
            </div>

            <FormInput
              label="Full Name"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSaving}
            />
            <FormInput
              label="Email Address"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />

            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {saveError}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
              {isSaved && <span className="text-brand-accent text-sm font-medium">Profile saved!</span>}
            </div>
          </form>
        )}

        {activeTab === 'Security' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
            <FormInput label="Current Password" type="password" id="currentPassword" name="currentPassword" value="" onChange={() => {}} />
            <FormInput label="New Password" type="password" id="newPassword" name="newPassword" value="" onChange={() => {}} />
            <FormInput label="Confirm New Password" type="password" id="confirmPassword" name="confirmPassword" value="" onChange={() => {}} />
            <div>
              <button type="button" className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors">
                Update Password
              </button>
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