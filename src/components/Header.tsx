"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-slate-200/60 sticky top-0 z-40 bg-white/80 backdrop-blur">
      <div className="container-section py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png?v=2" alt="NUET Prep Academy logo" width={112} height={32} priority />
          <span className="text-primary font-semibold text-lg sm:text-xl">NUET Prep Academy</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-slate-700">
          <Link href="/" className="hover:text-primary">Home</Link>
          <Link href="/courses" className="hover:text-primary">Courses</Link>
          <Link href="/about" className="hover:text-primary">About Us</Link>
          <Link href="/contact" className="hover:text-primary">Contact</Link>
        </nav>
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle Navigation"
        >
          <span className="i">☰</span>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200/60 bg-white">
          <div className="container-section py-3 flex flex-col gap-3">
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/courses" onClick={() => setOpen(false)}>Courses</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About Us</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
          </div>
        </div>
      )}
    </header>
  );
}

