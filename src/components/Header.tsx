"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, MessageCircle, BookOpen, Users, Settings, LogOut, BarChart3 } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                </div>
                <span className="text-xl font-bold text-slate-900">NUET PREP ACADEMY</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/courses" className="text-slate-700 hover:text-primary transition-colors">
              Courses
            </Link>
            {session && (
              <>
                <Link href="/my-courses" className="text-slate-700 hover:text-primary transition-colors">
                  My Courses
                </Link>
                <Link href="/chat" className="text-slate-700 hover:text-primary transition-colors flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat</span>
                </Link>
                {(session.user.role === 'OWNER' || session.user.role === 'ADMIN') && (
                  <Link href="/admin/dashboard" className="text-slate-700 hover:text-primary transition-colors flex items-center space-x-1">
                    <Settings className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                {session.user.role === 'TUTOR' && (
                  <Link href="/tutor/dashboard" className="text-slate-700 hover:text-primary transition-colors flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Tutor Dashboard</span>
                  </Link>
                )}
                {session.user.role === 'STUDENT' && (
                  <Link href="/student/dashboard" className="text-slate-700 hover:text-primary transition-colors flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>Student Dashboard</span>
                  </Link>
                )}
              </>
            )}
            <Link href="/about" className="text-slate-700 hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-slate-700 hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* User Menu / Auth */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-2 text-slate-700 hover:text-primary transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block">{session.user.name}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-slate-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-slate-700 hover:text-primary hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="block px-3 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
            {session && (
              <>
                <Link
                  href="/my-courses"
                  className="block px-3 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Courses
                </Link>
                <Link
                  href="/chat"
                  className="block px-3 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Chat
                </Link>
                {(session.user.role === 'OWNER' || session.user.role === 'ADMIN') && (
                  <Link
                    href="/admin/dashboard"
                    className="block px-3 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {session.user.role === 'TUTOR' && (
                  <Link
                    href="/tutor"
                    className="block px-3 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tutor Panel
                  </Link>
                )}
              </>
            )}
            <Link
              href="/about"
              className="block px-3 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

