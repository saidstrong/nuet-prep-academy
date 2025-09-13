"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { resetPasswordSchema } from '@/lib/validation';

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/auth/forgot-password');
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const result = resetPasswordSchema.safeParse({
      token,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        const field = error.path[0] as string;
        if (field !== 'token') {
          newErrors[field] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successfully. Please sign in with your new password.');
        }, 3000);
      } else {
        setErrors({ 
          general: data.message || 'Failed to reset password. The link may have expired.' 
        });
      }
    } catch (error) {
      setErrors({ 
        general: 'An error occurred. Please try again.' 
      });
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
              <h2 className="text-lg font-semibold mb-2">Password Reset Successful!</h2>
              <p>Your password has been reset successfully. You will be redirected to the sign-in page shortly.</p>
            </div>
            <Link 
              href="/auth/signin" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Go to Sign In
            </Link>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Your Password</h1>
            <p className="text-slate-600">Enter your new password below</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Enter your new password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <span className="text-slate-400 hover:text-slate-600">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Confirm your new password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <span className="text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
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
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
