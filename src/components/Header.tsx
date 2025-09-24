"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, MessageCircle, BookOpen, Users, Settings, LogOut, BarChart3, Trophy } from 'lucide-react';
import MobileNavigation from './MobileNavigation';
import LanguageSwitch from './LanguageSwitch';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { data: session } = useSession();

  // Fetch user avatar separately to avoid session size issues
  useEffect(() => {
    if (session?.user?.id && !userAvatar && !avatarLoading) {
      setAvatarLoading(true);
      fetch('/api/user/avatar', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.avatar) {
            setUserAvatar(data.avatar);
          }
        })
        .catch(err => console.error('Error fetching avatar:', err))
        .finally(() => setAvatarLoading(false));
    }
  }, [session?.user?.id, userAvatar, avatarLoading]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-xl border-b-4 border-blue-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-2xl font-bold text-white tracking-wide">
                      NUET PREP ACADEMY
                    </span>
                    <div className="text-blue-200 text-sm font-medium">
                      Excellence in Education
                    </div>
                  </div>
                  <span className="text-xl font-bold text-white sm:hidden">
                    NUET
                  </span>
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link href="/" className="px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium text-sm">
                Home
              </Link>
              <Link href="/courses" className="px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium text-sm">
                Courses
              </Link>
              {session && (
                <>
                  <Link href="/my-courses" className="px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium text-sm">
                    My Courses
                  </Link>
                  
                  {/* Progress and Chat links hidden as requested */}
                  
                  {(session.user.role === 'OWNER' || session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
                    <>
                      <Link href="/admin/dashboard" className="px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-1 text-sm">
                        <Settings className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                      <Link href="/admin/courses" className="px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-1 text-sm">
                        <BookOpen className="w-4 h-4" />
                        <span>Courses</span>
                      </Link>
                      <Link href="/admin/analytics" className="px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-1 text-sm">
                        <BarChart3 className="w-4 h-4" />
                        <span>Analytics</span>
                      </Link>
                    </>
                  )}
                  {session.user.role === 'TUTOR' && (
                    <Link href="/tutor/dashboard" className="px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-1 text-sm">
                      <BookOpen className="w-4 h-4" />
                      <span>Tutor</span>
                    </Link>
                  )}
                  {session.user.role === 'STUDENT' && (
                    <Link href="/student/dashboard" className="px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-1 text-sm">
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* User Menu / Auth */}
            <div className="flex items-center space-x-2">
              {/* Language Switch */}
              <LanguageSwitch className="hidden sm:block" />
              
              {session ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile" className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors group">
                    <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 overflow-hidden">
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt="Profile" 
                          className="w-9 h-9 rounded-full object-cover"
                          onError={(e) => {
                            // If image fails to load, show default letter
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-white font-bold text-sm ${userAvatar ? 'hidden' : ''}`}>
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden lg:block text-right">
                      <div className="text-white font-medium text-sm">{session.user.name}</div>
                      <div className="text-blue-200 text-xs capitalize">{session.user.role}</div>
                    </div>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="hidden md:flex items-center space-x-1 px-3 py-2 text-blue-100 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-all duration-200 font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-lg text-blue-100 hover:text-white hover:bg-blue-700/50 transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

