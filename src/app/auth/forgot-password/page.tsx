"use client";
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { forgotPasswordSchema } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main>
        <Header />
        <div className="container-section py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              <h2 className="text-lg font-semibold mb-2">Check Your Email</h2>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
              <p className="mt-2 text-sm">Please check your email and click the link to reset your password.</p>
            </div>
            <div className="space-y-4">
              <Link 
                href="/auth/signin" 
                className="block text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Sign In
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="block text-slate-600 hover:text-slate-500 font-medium"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="container-section py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Your Password?</h1>
            <p className="text-slate-600">No worries! Enter your email address and we'll send you a link to reset your password.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email address"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium ${
                loading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Remember your password?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
