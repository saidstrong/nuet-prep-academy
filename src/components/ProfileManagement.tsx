"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Camera, Save, X, Phone, MessageCircle, FileText, Lock, Eye, EyeOff } from 'lucide-react';

interface Profile {
  name: string;
  bio: string;
  phone: string;
  whatsapp: string;
  avatar: string;
}

export default function ProfileManagement() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile>({
    name: '',
    bio: '',
    phone: '',
    whatsapp: '',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;
      
      try {
        setInitialLoading(true);
        const response = await fetch('/api/profile', { credentials: 'include' });
        const data = await response.json();
        
        if (data.success) {
          setProfile(data.profile);
        } else {
          // If no profile exists yet, set default name from session
          setProfile(prev => ({
            ...prev,
            name: session.user.name || ''
          }));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Fallback to session name
        setProfile(prev => ({
          ...prev,
          name: session.user.name || ''
        }));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleInputChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setIsEditing(false);
        
        // Update the profile state with the returned data to ensure consistency
        setProfile(data.profile);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reload profile data from API to reset to original values
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile', { credentials: 'include' });
        const data = await response.json();
        
        if (data.success) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile on cancel:', error);
      }
    };

    fetchProfile();
    setIsEditing(false);
    setMessage(null);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    try {
      setUploadingAvatar(true);
      setMessage(null);

      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload the file
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      console.log('Avatar upload response:', data);

      if (data.success) {
        // Update profile with the uploaded image URL
        setProfile(prev => ({
          ...prev,
          avatar: data.url
        }));
        setMessage({ type: 'success', text: data.message || 'Avatar uploaded successfully!' });
      } else {
        console.error('Avatar upload failed:', data);
        setMessage({ type: 'error', text: data.error || 'Failed to upload avatar' });
      }
    } catch (error) {
      console.error('Avatar upload network error:', error);
      setMessage({ type: 'error', text: `Network error: ${error instanceof Error ? error.message : 'Please try again.'}` });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    setChangingPassword(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordChange(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          Please sign in to manage your profile.
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show default icon
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <User className={`w-10 h-10 text-gray-400 ${profile.avatar ? 'hidden' : ''}`} />
            </div>
            {isEditing && (
              <label className={`absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Profile Picture' : 'Current Avatar'}
            </h3>
            <p className="text-sm text-gray-500">
              {uploadingAvatar ? 'Uploading image...' : isEditing ? 'Click the camera icon to upload a new image' : 'Your profile picture'}
            </p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {profile.name || 'Not set'}
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {profile.phone || 'Not set'}
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="w-4 h-4 inline mr-2" />
              WhatsApp
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your WhatsApp number"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {profile.whatsapp || 'Not set'}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[60px]">
                {profile.bio || 'No bio added yet'}
              </div>
            )}
          </div>
        </div>

        {/* Password Change Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Change Password
            </h3>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordChange && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !profile.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
