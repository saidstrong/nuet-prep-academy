"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, BookOpen, User as UserIcon } from 'lucide-react';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [logoSrc, setLogoSrc] = useState('/logo.png?v=2');

  return (
    <header className="border-b border-slate-200/60 sticky top-0 z-40 bg-white/80 backdrop-blur">
      <div className="container-section py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logoSrc}
            alt="NUET Prep Academy logo"
            width={112}
            height={32}
            priority
            onError={() => setLogoSrc('/logo.svg?v=3')}
          />
          <span className="text-primary font-semibold text-lg sm:text-xl">NUET Prep Academy</span>
        </Link>
        
        <nav className="hidden md:flex gap-6 text-slate-700">
          <Link href="/" className="hover:text-primary">Home</Link>
          <Link href="/courses" className="hover:text-primary">Courses</Link>
          {session && (
            <Link href="/my-courses" className="hover:text-primary">My Courses</Link>
          )}
          <Link href="/about" className="hover:text-primary">About Us</Link>
          <Link href="/contact" className="hover:text-primary">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-slate-700 hover:text-primary"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{session.user.name}</span>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {session.user.role === 'OWNER' && (
                    <Link
                      href="/admin/add-tutor"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Add Tutor
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/signin" className="btn-accent">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Sign Up</Link>
            </div>
          )}

          <button
            className="md:hidden inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle Navigation"
          >
            <span className="i">☰</span>
          </button>
        </div>
      </div>
      
      {open && (
        <div className="md:hidden border-t border-slate-200/60 bg-white">
          <div className="container-section py-3 flex flex-col gap-3">
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/courses" onClick={() => setOpen(false)}>Courses</Link>
            {session && (
              <Link href="/my-courses" onClick={() => setOpen(false)}>My Courses</Link>
            )}
            <Link href="/about" onClick={() => setOpen(false)}>About Us</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
            {session ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)}>Profile</Link>
                <button onClick={() => signOut()} className="text-left">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" onClick={() => setOpen(false)}>Sign In</Link>
                <Link href="/auth/signup" onClick={() => setOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

