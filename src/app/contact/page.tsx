"use client";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || '')
    };

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setStatus('sent');
      form.reset();
    }
  }

  return (
    <main>
      <Header />
      <section className="container-section pt-10 pb-16 grid gap-10 md:grid-cols-2 items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
          <p className="text-slate-600 mt-2">We typically respond within one business day.</p>
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <input required name="name" placeholder="Your name" className="w-full rounded-md border border-slate-300 px-4 py-3" />
            <input required type="email" name="email" placeholder="Email" className="w-full rounded-md border border-slate-300 px-4 py-3" />
            <textarea required name="message" placeholder="Message" rows={5} className="w-full rounded-md border border-slate-300 px-4 py-3" />
            <button className="btn-primary w-fit">Send</button>
            {status === 'sent' && (
              <div className="text-green-700 text-sm">Message received. We will contact you soon.</div>
            )}
          </form>
          <div className="mt-6 flex gap-3">
            <a href="mailto:amanzhol.said08@gmail.com" className="btn-primary">Email us</a>
            <a href="https://wa.me/77075214911" target="_blank" className="btn-accent">WhatsApp</a>
          </div>
        </div>
        <div>
          <div className="aspect-video rounded-xl border border-slate-200 bg-slate-50" />
          <div className="text-sm text-slate-500 mt-2">Map placeholder for offline classes</div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

