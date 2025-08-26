"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { User, Phone, Mail, MapPin, GraduationCap, Briefcase } from 'lucide-react';

interface ProfileData {
  bio: string;
  phone: string;
  avatar: string;
  address: string;
  education: string;
  experience: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    bio: '',
    phone: '',
    avatar: '',
    address: '',
    education: '',
    experience: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  if (status === 'loading') {
    return (
      <main>
        <Header />
        <div className="container-section py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main>
      <Header />
      <div className="container-section py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-accent"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Profile Photo */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-slate-400" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{session.user.name}</h2>
                <p className="text-slate-600 capitalize">{session.user.role}</p>
              </div>

              {/* Profile Details */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={session.user.email}
                      disabled
                      className="w-full px-4 py-3 border border-slate-300 rounded-md bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50"
                      placeholder="Enter address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <GraduationCap className="inline w-4 h-4 mr-2" />
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={profile.education}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50"
                      placeholder="Enter education details"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Briefcase className="inline w-4 h-4 mr-2" />
                      Experience
                    </label>
                    <textarea
                      name="experience"
                      value={profile.experience}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50"
                      placeholder="Enter experience details"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50"
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  {isEditing && (
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
