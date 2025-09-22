"use client";
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  User, 
  MessageSquare, 
  Trophy, 
  Target, 
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Search
} from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Fetch user avatar separately to avoid session size issues
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/user/avatar')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.avatar) {
            setUserAvatar(data.avatar);
          }
        })
        .catch(err => console.error('Error fetching avatar:', err));
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      roles: ['STUDENT', 'TUTOR', 'ADMIN', 'MANAGER']
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: BookOpen,
      roles: ['STUDENT', 'TUTOR', 'ADMIN', 'MANAGER']
    },
    {
      name: 'Dashboard',
      href: '/student/dashboard',
      icon: Home,
      roles: ['STUDENT']
    },
    {
      name: 'My Courses',
      href: '/my-courses',
      icon: BookOpen,
      roles: ['STUDENT']
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: BarChart3,
      roles: ['STUDENT']
    },
    {
      name: 'Study Streak',
      href: '/study-streak',
      icon: Trophy,
      roles: ['STUDENT']
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: Trophy,
      roles: ['STUDENT']
    },
    {
      name: 'Challenges',
      href: '/challenges',
      icon: Target,
      roles: ['STUDENT']
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare,
      roles: ['STUDENT', 'TUTOR', 'ADMIN', 'MANAGER']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['STUDENT', 'TUTOR', 'ADMIN', 'MANAGER']
    },
    {
      name: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: Settings,
      roles: ['ADMIN', 'OWNER', 'MANAGER']
    },
    {
      name: 'Tutor Dashboard',
      href: '/tutor/dashboard',
      icon: Users,
      roles: ['TUTOR']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    session?.user?.role && item.roles.includes(session.user.role)
  );

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Mobile Menu */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">NUET Prep</h1>
                <p className="text-xs text-gray-500">Academy</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        // If image fails to load, show default letter
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`text-white font-semibold text-lg ${userAvatar ? 'hidden' : ''}`}>
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {session.user.role?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Settings</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
